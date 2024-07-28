import React, { useState, Fragment } from 'react'
import { PaperAirplaneIcon, FaceSmileIcon, HandThumbUpIcon, PaperClipIcon, PhotoIcon, XCircleIcon } from '@heroicons/react/24/solid'
import NewMessageInput from './NewMessageInput'
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { Popover, Transition } from '@headlessui/react';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { isAudio, isImage } from '@/helpers';
import AttachmentPreview from './AttachmentPreview';

const MessageInput = ({conversation = null}) => {

    const  [newMessage, setnewMessage] = useState("");
    const [inputErrorMessage, setinputErrorMessage] = useState("");
    const [messsageSending, setMesssageSending] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [choosenFiles, setChoosenFiles] = useState([]);
    const sendRequest =  (formData)=>{
        axios.post(route('message.store'), formData, {
            onUploadProgress:(progressEvent)=>{
                const progress = Math.round((progressEvent.loaded/progressEvent.total) * 100);
            }
        }).then((response)=>{
            setnewMessage("");
            setMesssageSending(false);
        }).catch((err)=>{
            setMesssageSending(false)
        })
    }
    const onSendClick =()=>{
        if(messsageSending) return
        if(newMessage.trim() == "" && choosenFiles.length === 0){
            setinputErrorMessage("Please provide a message or upload attachments");
            setTimeout(()=>{
                setinputErrorMessage("");
            },300);
            return;
        }

        const formData = new FormData();
        choosenFiles.forEach((file)=>{
            formData.append("attachments[]", file.file)
        })
        formData.append("message", newMessage )
        if(conversation.is_user){
            formData.append("receiver_id", conversation.id)
        }else{
            formData.append("group_id", conversation.id)
        }

        setMesssageSending(true);
        axios.post(route('message.store'), formData, {
            onUploadProgress:(progressEvent)=>{
                const progress = Math.round((progressEvent.loaded/progressEvent.total) * 100);
                setUploadProgress(progress);
            }
        }).then((response)=>{
            setnewMessage("");
            setMesssageSending(false);
            setChoosenFiles([]);
            setUploadProgress(0);
        }).catch((err)=>{
            setMesssageSending(false)
            setChoosenFiles([]);
            const message = err?.response?.data?.message;
            setinputErrorMessage(message || "An Error occur while sending message ")
        })
    }
    const onThumbClick = ()=>{
        if(messsageSending){
            return;
        }
        const data = {
            message:"thumb"
        }
        if(conversation.is_user){
            data["receiver_id"] =  conversation.id
        }else{
            data["group_id"] = conversation.id;
        }
        axios.post(route('message.store'), data)
    }
    const onFileChange = (e)=>{
        const files = e.target.files;
        const updatedFiles = [...files].map((file)=>{
            return{
                file:file,
                url:URL.createObjectURL(file),
            }
        });
        e.target.value = null;
        setChoosenFiles((prevFiles)=>{
            return [...prevFiles, ...updatedFiles];
        })
    }

  return (
    <div className="flex flex-wrap items-start border-t border-slate-700 py-3">
        <div className="order-2 flex-1 xs:flex-none xs:order-1 p-2">
            <button className="p-1 text-gray-400 hover:text-gray-300 relative">
                <PaperClipIcon className='w-6' />
                <input
                    type='file'
                    multiple
                    onChange={onFileChange}
                    className='absolute left-0 top-0 bottom-0 right-0 z-20 opacity-0 cursor-pointer'
                />
            </button>

            <button className="p-1 text-gray-400 hover:text-gray-300 relative">
                <PhotoIcon className='w-6' />
                <input
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={onFileChange}
                    className='absolute left-0 top-0 bottom-0 right-0 z-20 opacity-0 cursor-pointer'
                />
            </button>
        </div>

        <div className='order-1 px-3 xs:p-0 min-w-[200px] basis-full xs:basis-0 xs:order-2 flex-1 relative'>
            <div className="flex">
                <NewMessageInput value={newMessage} onChange={(e)=>setnewMessage(e.target.value)} onSend={onSendClick}/>
                <button className="btn btn-info rounded-1-none" onClick={onSendClick} disabled={messsageSending}>
                    {messsageSending &&(
                        <span className="loading loading-spinner loading-xs"></span>
                    )}
                    <PaperAirplaneIcon className='w-6' />
                    <span className='hidden sm:inline'>Send</span>
                </button>
            </div>
            {!!uploadProgress &&(
                <progress
                    className='progress progress-info w-full'
                    value={uploadProgress}
                    max="100"
                ></progress>
            )}
            {inputErrorMessage && (
                <p className="text-xs text-red-400">{inputErrorMessage}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
                {choosenFiles.map((file)=>(
                    <div
                        key={file.file.name}
                        className={`relative flex justify-between cursor-pointer` + (!isImage(file.file)? "w-[240px]": "")}
                    >
                        {isImage(file.file) &&(
                            <img src={file.url} alt="" className='w-16 h-16 object-cover'/>
                        )}
                        {isAudio(file.file) &&(
                            <CustomAudioPlayer
                                file={file}
                                showVolume={false}
                            />
                        )}
                        {!isAudio(file.file) && !isImage(file.file) &&(
                            <AttachmentPreview
                                file={file}
                            />
                        )}
                        <button
                            className="absolute w-6 h-6 rounded-full bg-gray-800 -right-2 -top-2 text-gray-300 hover:text-gray-100 z-10"
                            onClick={()=>{
                                setChoosenFiles(choosenFiles.filter(
                                    (f)=>f.file.name !==file.file.name
                                ))
                            }}
                        >
                            <XCircleIcon className='w-6' />
                        </button>
                    </div>
                ))}
            </div>
        </div>
        <div className="order-3 xs:order-3 p-2 flex">
            <Popover className="relative">
                <Popover.Button className="p-1 text-gray-400 hover:text-gray-300">
                    <FaceSmileIcon className='w-6 h-6' />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 right-0 bottom-full">
                    <EmojiPicker theme='dark' onEmojiClick={(e)=> setnewMessage(newMessage + e.emoji)}>

                    </EmojiPicker>
                </Popover.Panel>
            </Popover>
            <button className="p-1 text-gray-400 hover:text-gray-300">

            </button>
            <button className="p-1 text-gray-400 hover:text-gray-300">
                <HandThumbUpIcon className='w-6 h-6' onClick={onThumbClick}/>
            </button>
        </div>
    </div>
  )
}

export default MessageInput
