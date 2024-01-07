import Head from "next/head";
import { api } from "~/utils/api";
import type { GetStaticProps, NextPage } from "next";
import { PostView } from "~/components/postview";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssghelper";

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"}
}

const SinglePostPage:NextPage<{id: string}> = ({id}) => {
  const {data} = api.post.getById.useQuery({id}); 

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};


export const getStaticProps: GetStaticProps = async (context) => {
  // now the loading state is never hit, cool!
  const ssg = generateSSGHelper();
  
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no slug");

  await ssg.post.getById.prefetch({ id });
  
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  }
}

export default SinglePostPage;