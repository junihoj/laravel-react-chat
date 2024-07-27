import {Link, usePage} from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import UserOptionsDropdown from "./UserOptionsDropdown";
const ConversationItem = ({
    conversation,
    online=null,
    selectedConversation
})=>{
    const page = usePage();
    const currentUser = page.props.auth.user;
    let classes = "border-transaprent"
    if(selectedConversation){
        if(
            !selectedConversation.is_group &&
            !conversation.is_group &&
            selectedConversation.id == conversation.id
        ){
            classes = "border-blue-500 bg-black/20"
        }
        if(
            selectedConversation.is_group &&
            conversation.is_group &&
            selectedConversation.id == conversation.id
        ){
            classes = "border-blue-500 bg-black/20"
        }
    }
    let routeTo;
    if(conversation.is_group){
        console.log("CONVERSATION", conversation)
        routeTo = route("chat.group", conversation)
    }else{
        routeTo = route("chat.user", conversation)
    }
    if(conversation.is_group){
        console.log("ROUTE TO", routeTo)
    }
    return(
        <Link
            href={routeTo}
            preserveState
            className={
                "conversation-item flex items-center gap p-2 text-gray-300 transition-all" +
                classes + (conversation.is_user && currentUser.is_admin? "pr-2": "pr-4")
            }
        >
            {conversation.is_user && (
                <UserAvatar user={conversation} online={online} />
            )}

            {conversation.is_group && <GroupAvatar />}

            <div
                className={
                    `flex-1 text-xs max-w-full overflow-hidden` +
                    (conversation.is_user && conversation.blocked_at?
                        "opacity-50" :""
                    )
                }
            >
                <div className="flex gap-1 justify-between items-center">
                    <h3 className="text-sm font-semibold overflow-hidden text-nowrap text-ellipsis">
                        {conversation.name}
                    </h3>
                    {
                        conversation.last_message_date &&(
                            <span className="text-nowrap">
                                {conversation.last_message_date}
                            </span>
                        )
                    }
                </div>
                {conversation.last_message &&(
                    <p className="text-xs text-nowrap text-ellipsis overflow-hidden">
                        {conversation.last_message}
                    </p>
                )}

            </div>
            {currentUser.is_admin && conversation.is_user &&(
                <UserOptionsDropdown conversation={conversation} />
            )}
        </Link>
    )
}

export default ConversationItem;
