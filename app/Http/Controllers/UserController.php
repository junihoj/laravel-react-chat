<?php

namespace App\Http\Controllers;

use App\Mail\UserBlockedUnblocked;
use App\Mail\UserCreated;
use App\Mail\UserRoleChanged;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
class UserController extends Controller
{
    public function store(Request $request){
        $data = $request->validate([
            'name'=>'required|string',
            'email' => ['required', 'email', 'unique:users,email'],
            'is_admin' => 'boolean',
        ]);

        $rawPassword = Str::random(8);
        $data['password'] = bcrypt($rawPassword);
        $data['email_verified_at'] = now();

        $user = User::create($data);
        Mail::to($user->email)->send(new UserCreated($user,$rawPassword) );
        return redirect()->back();
    }
    public function changeRole(User $user){
        $user->update(['is_admin' => !(bool) $user->admin]);

        $message = "User Role has been to" . ($user->is_admin ? "Admin": "Regular User");
        Mail::to($user->email)->send(new UserRoleChanged($user) );
        return response()->json(['Message'=> $message]);
    }

    public function blockUnblock(User $user){
        if($user->block_at){
           $user->block_at = null;
           $message = "Your account has been unblocked";
        }else{
            $user->block_at = now();
            $message = "Your Account has been blocked";
        }

        $user->save();
        Mail::to($user->email)->send(new UserBlockedUnblocked($user) );
        return response()->json(["message"=> $message]);
    }
}
