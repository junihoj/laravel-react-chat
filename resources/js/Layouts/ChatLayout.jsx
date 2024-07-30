import { router, usePage } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import AuthenticatedLayout from './AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
// import Echo from 'laravel-echo';
import {PencilSquareIcon} from '@heroicons/react/24/solid'
import ConversationItem from '@/Components/App/ConversationItem'
import { useEventBus } from '@/EventBus';
import GroupModal from '@/Components/App/GroupModal';
const ChatLayout = ({ children}) => {

    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const {on, emit} = useEventBus();
    // console.log("conversations", conversations)
    console.log("selected conversations", selectedConversation)
    const [onlineUsers, setOnlineUsers]  = useState({});
    const isUserOnline = (userId)=>onlineUsers[userId];
    const [localConversations, setLocacalConversations] = useState([]);
    const [sortedConversatons, setSortedConversations] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);

    const messageCreated = (message)=>{
        setLocacalConversations((oldUser)=>{
            return oldUser.map((u)=>{
                if(message.receiver_id && !u.is_group && (u.id==message.sender_id || u.id == message.receiver_id)){
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }

                if(message.group_id && u.is_group && u.id == message.group_id){
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }
                return u;
            })
        })
    }

    const messageDeleted = ({prevMessage})=>{
        if(!prevMessage){
           return;
        }

        setLocacalConversations((oldUser)=>{
            return oldUser.map((u)=>{
                if(prevMessage.receiver_id  && !u.is_group && (u.id==message.sender_id || u.id == message.receiver_id)){
                    u.last_message = prevMessage.message;
                    u.last_message_date = prevMessage.created_at;
                    return u;
                }

                if(prevMessage.group_id  && u.is_group && u.id == message.group_id){
                    u.last_message = prevMessage.message;
                    u.last_message_date = prevMessage.created_at;
                    return u;
                }
                return u;
            })
        })
    }

    useEffect(()=>{
        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);
        const offModalShow = on("GroupModal.show", (group)=>{
            setShowGroupModal(true);
        })
        const offGroupDeleted = on("group.deleted", ({id, name})=>{
            setLocacalConversations((oldConversations)=>{
                return oldConversations.filter((con)=>{
                    return con.id != id;
                });
            });

            emit('toast.show', `Group ${name} was deleted` );
            if(!selectedConversation ||  selectedConversation.is_group && selectedConversation.id== id){
                router.visit(route("dashboard"));
            }
        })
        return ()=>{
            offCreated();
            offDeleted();
            offModalShow();
            offGroupDeleted();
        }
    },[on])
    useEffect(()=>{
        Echo.join('online')
        .here((users)=>{
            const onlineUsersObj = Object.fromEntries(
                users.map((user)=>[user.id, user])
            )

            setOnlineUsers((prevOnlineUsers)=>{
                return{
                    ...prevOnlineUsers,
                   ...onlineUsersObj
                }
            });
        })
        .joining((user)=>{
            setOnlineUsers((prevOnlineUsers)=>{
                const updatedUsers = {...prevOnlineUsers};
                updatedUsers[user.id] = user;
                return updatedUsers;

            })
        }).leaving((user)=>{
            setOnlineUsers((prevOnlineUsers)=>{
                const updatedUsers = {...prevOnlineUsers};
                delete updatedUsers[user.id];
                return updatedUsers;

            })
        })
        .error((error)=>{
            console.log("ERROR", error)
        })

        return()=>{
            Echo.leave("online");
        }
    },[])

    useEffect(()=>{
        setLocacalConversations(conversations);
    },[conversations])


    useEffect(()=>{
       setSortedConversations(
        localConversations.sort((a,b)=>{
            if(a.block_at && b.blocked_at){
                return a.blocked_at > b.bloced_at ? 1: -1;
            }else if (a.block_at){
                return 1;
            }else if(b.bloced_at){
                return -1;
            }

            if(a.last_message_date && b.last_message_date){
                return b.last_message_date.localeCompare(
                    a.last_message
                )
            }else if(a.last_message_date){
                return -1
            }else if(b.last_message_date){
                return 1;
            }else{
                return 0;
            }

        })
       )
    },[localConversations])

    const onSearch = (e)=>{
        const search = e.target.value.toLowerCase();
        setLocacalConversations(
            conversations.filter((conversation)=>{
                return (
                    conversation.name.toLowerCase().includes(search) ||
                    conversation.email.toLowerCase().includes(search)
                );
            })
        )
    }
  return (
    <>
        <div className='flex-1 w-full flex overflow-hidden'>
            <div className={`transition-all w-full sm:w-[220px] md:w-[300pxx] bg-slate-800 flex flex-col overflow-hidden ${
                selectedConversation ? '-ml-[100%] sm:ml-0': ""
                }`}
            >
                <div className='flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200'>
                    My Conversations
                    <div
                        className='tooltip tooltip-left'
                        data-tip="Create new Group"
                    >
                        <button
                            className='text-gray-400 hover:text-gray-200'
                            onClick={()=>setShowGroupModal(true)}
                        >
                            <PencilSquareIcon className= "w-4 h-4 inline-block ml-2" />
                        </button>
                    </div>
                </div>

                <div className='p-3'>
                    <TextInput
                        onKeyUp={onSearch}
                        placeholder="Fliter users and groups"
                        className="w-full"
                    />
                </div>
                {/* Conversations */}
                <div className='flex-1 overflow-auto'>
                    {sortedConversatons && (
                        sortedConversatons.map((conversation)=>(
                            <ConversationItem
                                key={`${
                                    conversation.is_group
                                        ? "group_"
                                        : 'user_'
                                }${conversation.id}`}
                                conversation={conversation}
                                online={!!isUserOnline(conversation.id)}
                                selectedConversation={selectedConversation}
                            />
                        ))
                    )}
                </div>
            </div>
            <div className='flex-1 flex flex-col overflow-hidden'>
                {children}
            </div>
        </div>

        <GroupModal show={showGroupModal} onClose={()=> setShowGroupModal(false)}/>
    </>

  )
}

export default ChatLayout
