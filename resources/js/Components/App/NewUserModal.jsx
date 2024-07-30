import React, {useEffect, useState} from 'react';
import TextAreaInput from '../TextAreaInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import UserPicker from '@/Components/App/UserPicker';
import { useForm, usePage } from '@inertiajs/react';
import { useEventBus } from '@/EventBus';
import InputLabel from '../InputLabel';
import Checkbox from '../Checkbox';

const NewUserModal = ({show=false, onClose=()=>{}}) => {
    const page = usePage();
    const { emit} = useEventBus();
    const {data, setData, processing, reset, post, errors} = useForm({
        name:"",
        email:"",
        is_admin:false,
    });


    const submit = (e)=>{
        e.preventDefault();

        post(route("user.store", {
            onSuccess:()=>{
                emit("toast.show", `Group "${data.name}" was created`);
                closeModal();
            }
        }));
    }

    const closeModal = ()=>{
        reset();
        onClose();
    }


  return (
    <Modal show={show} onClose={closeModal}>
        <form onSubmit={submit} className='p-6 overflow-y-auto'>
            <h2 className='text-xl font-medium text-gray-900 dark:text-gray-100'>
                Add New User
            </h2>

            <div className="mt-8">
                <InputLabel htmlFor="name" value="Name" />
                <TextInput
                    id="name"
                    className="m-1 block w-full"
                    value={data.name}
                    onChange={(e)=>setData("name", e.target.value)}
                    required
                    isFocused
                />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="email" value="email" />
                <TextInput
                    id="email"
                    className="m-1 block w-full"
                    value={data.name}
                    onChange={(e)=>setData("email", e.target.value)}
                    required
                />
                <InputError className="mt-2" message={errors.email} />
            </div>
            <div className="block mt-4">
                <label className="flex items-center">
                    <Checkbox
                        name="is_admin"
                        checked={data.is_admin}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">Admin User</span>
                </label>
                <InputError className='mt-2' message={errors.is_admin}/>
            </div>
            <div className="mt-6 flex justify-end">
                <SecondaryButton onClick={closeModal}>
                    Cancel
                </SecondaryButton>
                <PrimaryButton onClick={closeModal} className='ms-3' disabled={processing}>
                    Create
                </PrimaryButton>
            </div>
        </form>
    </Modal>
  )
}

export default NewUserModal
