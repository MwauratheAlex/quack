import Image from "next/image";
import { 
  SignInButton, 
  SignOutButton, 
  useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
// import { UserButton } from "@clerk/nextjs";
import { PostView } from "~/components/postview";

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
