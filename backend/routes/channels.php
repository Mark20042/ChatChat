<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Group;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat', function ($user) {
    return ['id' => $user->id, 'user_name' => $user->user_name];
});


Broadcast::channel('group.{groupId}', function ($user, $groupId) {
    $group = Group::find($groupId);
    return $group && $group->members->contains($user->id);
});