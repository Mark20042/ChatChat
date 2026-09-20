<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use App\Events\GroupMessageSent;
use App\Events\GroupDeleted;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    // Fetch all groups the authenticated user belongs to
    public function index(Request $request)
    {
        return response()->json($request->user()->groups()->with('members')->get());
    }

    // Create a new group & attach members
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'user_ids'   => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $group = Group::create([
            'name'       => $validated['name'],
            'creator_id' => $request->user()->id,
        ]);

        // Attach creator + selected users to the group
        $memberIds = array_unique(array_merge([$request->user()->id], $validated['user_ids']));
        $group->members()->attach($memberIds);

        return response()->json($group->load('members'), 201);
    }

    // Fetch message history for a group
    public function messages(Request $request, Group $group)
    {
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized access to group'], 403);
        }

        return response()->json($group->messages()->with('sender')->orderBy('created_at', 'asc')->get());
    }

    // Send a message to a group
    public function sendMessage(Request $request, Group $group)
    {
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized access to group'], 403);
        }

        $validated = $request->validate(['text' => 'required|string']);

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'group_id'  => $group->id,
            'text'      => $validated['text'],
        ]);

        $messageWithSender = $message->load('sender');

        // Broadcast WebSocket Event to group channel
        broadcast(new GroupMessageSent($messageWithSender))->toOthers();

        return response()->json($messageWithSender, 201);
    }

    // Delete a group (Creator only) - deletes all messages, detaches all members, and deletes group
    public function destroy(Request $request, Group $group)
    {
        if ((int) $request->user()->id !== (int) $group->creator_id) {
            return response()->json(['message' => 'Only the group creator can delete this group.'], 403);
        }

        $groupId = $group->id;

        // Broadcast GroupDeleted event to notify active members in real-time
        broadcast(new GroupDeleted($groupId))->toOthers();

        // Delete all messages belonging to this group
        $group->messages()->delete();

        // Detach all members from group_user pivot
        $group->members()->detach();

        // Delete the group record itself
        $group->delete();

        return response()->json(['message' => 'Group deleted successfully', 'group_id' => $groupId]);
    }

    // Leave Group (Members only)
    public function leave(Request $request, Group $group)
    {
        $userId = $request->user()->id;

        if (!$group->members()->where('user_id', $userId)->exists()) {
            return response()->json(['message' => 'You are not a member of this group.'], 403);
        }

        if ((int) $userId === (int) $group->creator_id) {
            return response()->json(['message' => 'Group creators cannot leave the group. You can delete the group instead.'], 400);
        }

        // Detach member
        $group->members()->detach($userId);

        // Create system notification message
        $systemMessage = Message::create([
            'sender_id' => $userId,
            'group_id'  => $group->id,
            'text'      => $request->user()->user_name . " left the group",
        ]);

        $messageWithSender = $systemMessage->load('sender');

        // Broadcast system notification to all members on the channel
        broadcast(new GroupMessageSent($messageWithSender));

        return response()->json([
            'message'  => 'Successfully left the group',
            'group_id' => $group->id,
        ]);
    }

    // Add Members to Group (Creator only)
    public function addMembers(Request $request, Group $group)
    {
        if ((int) $request->user()->id !== (int) $group->creator_id) {
            return response()->json(['message' => 'Only the group creator can add members.'], 403);
        }

        $validated = $request->validate([
            'user_ids'   => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        // Sync without detaching existing members
        $group->members()->syncWithoutDetaching($validated['user_ids']);

        // Create system notification message
        $addedUsers = User::whereIn('id', $validated['user_ids'])->get();
        $userNames = $addedUsers->pluck('user_name')->implode(', ');

        $systemMessage = Message::create([
            'sender_id' => $request->user()->id,
            'group_id'  => $group->id,
            'text'      => $request->user()->user_name . " added " . $userNames . " to the group",
        ]);

        $messageWithSender = $systemMessage->load('sender');

        // Broadcast system notification to all members
        broadcast(new GroupMessageSent($messageWithSender));

        return response()->json($group->load('members'));
    }
}
