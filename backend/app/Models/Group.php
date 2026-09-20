<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    protected $fillable = ['name', 'creator_id'];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_user', 'group_id', 'user_id');
    }

    public function users(): BelongsToMany
    {
        return $this->members();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
