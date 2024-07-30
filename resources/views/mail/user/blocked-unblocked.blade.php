<x-mail:message>
Hello {{$user->name}},
@if ($user->block_at)
your account has been suspended. You are no longer able to login.
@else
Your account has been activated. You can now normally use the system.
@endif
<x-mail:button url="{{route('login')}}">
    Click Here to Login
</x-mail:button>
Thank You, <br>
{{config('app.name')}}
</x-mail:message>
