import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { RouterOutputs } from "~/utils/api";
dayjs.extend(relativeTime);


type PostWithUsers = RouterOutputs["post"]["getAll"][number]

export const PostView = (props: PostWithUsers) => {
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