<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Events\MessageSent;

class MessageController extends Controller
{
    /**
     * Get all public/global messages.
     */
    public function index()
    {
        $messages = Message::with(['sender', 'receiver'])->get();
        return response()->json($messages);
    }

    /**
     * Store and broadcast a private chat message.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'text'        => 'required|string',
        ]);

        $message = Message::create([
            'sender_id'   => $request->user()->id, 
            'receiver_id' => $validated['receiver_id'],
            'text'        => $validated['text'],
        ]);

       
        broadcast(new MessageSent($message));

        return response()->json($message, 201);
    }

    /**
     * Fetch conversation history 
     */
    public function show(Request $request, $userId)
    {
        $currentUserId = $request->user()->id;

        $messages = Message::where(function ($query) use ($currentUserId, $userId) {
            $query->where('sender_id', $currentUserId)->where('receiver_id', $userId);
        })->orWhere(function ($query) use ($currentUserId, $userId) {
            $query->where('sender_id', $userId)->where('receiver_id', $currentUserId);
        })->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }
}