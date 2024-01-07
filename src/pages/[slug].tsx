import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { PostView } from "~/components/postview";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { generateSSGHelper } from "~/server/helpers/ssghelper";
import type { GetStaticProps, NextPage } from "next";

const ProfileFeed = (props: {userId: string}) => {
  const {data, isLoading} = api.post.getPostByUserId.useQuery({userId: props.userId})

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div>User has not posted.</div>

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id}/>
      ))}  
    </div>
  )
}

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"}
}

const ProfilePage:NextPage<{username: string}> = ({username}) => {
  const {data} = api.profile.getUserByUsername.useQuery({username})

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImgUrl} 
            alt={`${data.username}'s profile photo`}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-black border-4 bg-black" 
            height={128} 
            width={128} />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl">{`@${data.username}`}</div>
        <div className="w-full border-b border-slate-500"></div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};


export const getStaticProps: GetStaticProps = async (context) => {
  // now the loading state is never hit, cool!
  const ssg = generateSSGHelper();
  
  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");
  const username = slug.replace("@", "")
  // prefetch the user hence the absence of the loading state
  // we are doing this because userdata will rarely change???
  await ssg.profile.getUserByUsername.prefetch({username})
  
  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  }
}

export default ProfilePage;