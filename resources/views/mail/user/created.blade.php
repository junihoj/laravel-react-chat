<x-mail:message>
Hello {{$user->name}},
Your account has been created Successfully
**Here is your login information:** <br>
Email: {{$user->email}} <br>
password: {{$user->password}} <br>
Please Login to the system and change your password
<x-mail:button url="{{route('login')}}">
    Click Here to Login
</x-mail:button>
Thank You, <br>
{{config('app.name')}}
</x-mail:message>
