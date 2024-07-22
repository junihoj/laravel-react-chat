import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout'
export default function Home({ auth }) {
    return (
        <>messages</>
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
