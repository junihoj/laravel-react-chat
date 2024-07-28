import { useCallback, useEffect, useRef, useState } from 'react';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageInput from '@/Components/App/MessageInput';
import MessageItem from '@/Components/App/MessageItem';
import { useEventBus } from '@/EventBus';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

// TODO: FIX ATTACHMENT PREVIEW
//TODO: MULTIPLE ATTACHMENT SHOULD APPEAR IN TILES
export default function Home({selectedConversation, messages }) {
    const [localMessages, setlocalMessages] = useState([]);
    const [scrollFromBottom, setscrollFromBottom] = useState(0);
    const [noMoreMessages, setNoMoreMessages] = useState(false)
    const [previewAttachment, setPreviewAttachment] = useState({})
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false)
    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const {on} = useEventBus();

    const loadMoreMessages =useCallback(()=>{
        if(noMoreMessages) return
        const firstMessage = localMessages[0]
        axios.get(route("message.loadOlder", firstMessage.id)).then(({data})=>{
            if(data.data.length === 0){
                setNoMoreMessages(true);
                return;
            }
            //calculate how much is scrolled from bottom and scroll to the same position from bottom after messages are loaded
            const scrollHeight = messagesCtrRef.current.scrollHeight;
            const scrollTop = messagesCtrRef.current.scrollTop;
            const clientHeight = messagesCtrRef.current.clientHeight;
            const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
            setscrollFromBottom(tmpScrollFromBottom);
            setlocalMessages((prevMessages)=>{
                return [...data.data.reverse(), ...prevMessages]
            })
        });
    },[localMessages, noMoreMessages])
    const messageCreated = (message)=>{
        if(selectedConversation && selectedConversation.is_group && selectedConversation.id === message.group_id){
            setlocalMessages((prevMessages)=>[...prevMessages, message]);
        }

        if(
            selectedConversation &&
            selectedConversation.is_user &&
            selectedConversation.id === message.sender_id || selectedConversation.id == message.receiver_id
        ){
            setlocalMessages((prevMessages)=>[...prevMessages, message]);
        }
    }

    const messageDeleted = (message)=>{
        if(selectedConversation && selectedConversation.is_group && selectedConversation.id === message.group_id){
            setlocalMessages((prevMessages)=>{
                return prevMessages.filter((m)=> m.id !== message.id);
            });
        }

        if(
            selectedConversation &&
            selectedConversation.is_user &&
            selectedConversation.id === message.sender_id || selectedConversation.id == message.receiver_id
        ){
            setlocalMessages((prevMessages)=>{
                return prevMessages.filter((m)=> m.id !== message.id);
            });
        }
    }

    const onAttachmentClick = (attachments, ind)=>{
        setPreviewAttachment(
            attachments,
            ind,
        );
        setShowAttachmentPreview(true);
    }
    useEffect(()=>{
      setTimeout(()=>{
        if(messagesCtrRef.current){
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
        }
      },100)
     const offCreated =  on("message.created", messageCreated)
     const OffDeleted =  on("message.deleted", messageDeleted)
     setscrollFromBottom(0)
     setNoMoreMessages(false)
     return ()=>{
        offCreated();
        OffDeleted();
     }
    },[selectedConversation])
    useEffect(()=>{
        setlocalMessages(messages? messages.data.reverse(): [])
    },[messages]);

    useEffect(()=>{
        if(messagesCtrRef.current && scrollFromBottom !==null){
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight - messagesCtrRef.current.offSetHeight - scrollFromBottom;
        }

        if(noMoreMessages){
            return;
        }

        const observer = new IntersectionObserver(
            (entries)=> entries.forEach(
                (entry)=>entry.isIntersecting && loadMoreMessages()
            ),{rootMargin:"0px 0px 250px 0px"}
        )
        if(loadMoreIntersect.current){
            setTimeout(()=>{
                observer.observe(loadMoreIntersect.current);
            },100)
        }

        return ()=>{
            observer.disconnect();
        };
    },[localMessages])
    return (
        <>
        {!messages &&(
            <div className='flex flex-col gap-8 justify-center items-center text-center h-full opacity-35'>
                    <div className='text-2xl md:text-4xl p-16 text-slate-200'>
                        Please select Conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon  className='w-32 h-32 inline-block'/>
            </div>
        )}
        {messages &&(
            <>
                <ConversationHeader selectedConversation={selectedConversation} />
                <div ref={messagesCtrRef} className='flex-1 overflow-y-auto p-5'>
                    {localMessages.length === 0 && (
                        <div className='flex justify-center items-center h-full'>
                            <div className='text-lg text-slate-200'> No messsages found</div>
                        </div>
                    )}
                    {localMessages.length > 0 && (
                        <div className='flex-1 flex flex-col'>
                            <div ref={loadMoreIntersect}></div>
                                {localMessages.map((message)=>(
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                        attachmentClick={onAttachmentClick}
                                    />
                                ))}
                            </div>

                    )}
                </div>
                <MessageInput conversation={selectedConversation} />
            </>
        )}
            {previewAttachment.attachments &&(
                <AttachmentPreviewModal
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.ind}
                    show={showAttachmentPreview}
                    onClose={()=>setShowAttachmentPreview(false)}
                />
            )}
        </>
    );
}

Home.layout =  (page)=>{
    return (
        <AuthenticatedLayout
            user={page.props.auth.user}
        >
            <ChatLayout children={page}/>
        </AuthenticatedLayout>
    )
}
