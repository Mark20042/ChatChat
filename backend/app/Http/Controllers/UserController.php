<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get all users except the currently authenticated user.
     */
    public function index(Request $request)
    {
        // Get all users excluding the one using
        $users = User::where('id', '!=', $request->user()->id)
            ->select('id', 'user_name', 'email', 'created_at')
            ->get();

        return response()->json($users);
    }
}