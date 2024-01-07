import Image from "next/image";
import Link from "next/link";
import { 
  SignInButton, 
  SignOutButton, 
  useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
// import { UserButton } from "@clerk/nextjs";


import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";

const CreatePostWizard = () => {
  const {user} = useUser();
  const ctx = api.useContext();
  // would be wise to use a form library like react-hook-form and zod to handle errors
  // and validate the input before sending it to the server
  const {mutate, isLoading: isPosting} = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    }, 
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post. Please try again later!")
      }
    }});
  const [input, setInput] = useState("");

  if (!user) return null;

  return (
  <div className="flex gap-4">
    <Image 
      src={user.imageUrl} 
      alt="Profile image" 
      className="h-14 w-14 rounded-full"
      height={56}
      width={56}/>
    <input 
      placeholder="Type some emojis!" 
      className="bg-transparent grow outline-none"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (input !== "") {
            mutate({content: input})
          }
        }
      }}
      disabled={isPosting}
      />
    {input !== "" && !isPosting && (
      <button onClick={() => mutate({content: input})} disabled={isPosting}>
        Post
      </button>)
    }
    {isPosting && (
      <div className="flex items-center justify-center">
        <LoadingSpinner size={20} />
      </div>)}
  </div>
  )
}
type PostWithUsers = RouterOutputs["post"]["getAll"][number]

const PostView = (props: PostWithUsers) => {
  const {post, author}= props;
  return (
  <div key={post.id} className="border-b border-slate-500 p-4 gap-4 flex">
    <Image
      src={author.profileImgUrl} 
      alt={`@${author.username} profile picture`}
      className="h-14 w-14 rounded-full"
      height={56}
      width={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 font-bold gap-1">
          <Link href={`/@${author.username}`}><span>{`@ ${author.username}`}</span></Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{`. ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
  </div>
  )
}

const Feed = () => {
  const {data, isLoading: postsLoading} = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />
  if (!data) return <div>Something went wrong!</div>

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id}/>
      ))}
    </div>
  )
}

export default function Home() {
  const {isLoaded: userLoaded, isSignedIn} = useUser();

  //start fetching posts
  // react-query will cache the result to use in subsequent fetches
  api.post.getAll.useQuery();

  // return empty div if user is not loaded yet
  if (!userLoaded)  return <div />;

  return (
    <>
      <PageLayout>
        <div className="border-b border-slate-500 p-4">
          {isSignedIn && 
            <div>
              <CreatePostWizard />
              <SignOutButton/>
            </div>
          }
          {!isSignedIn && <SignInButton/>}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
}
