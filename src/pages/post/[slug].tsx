import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Comments from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
  prevPost: {
    uid: string;
    data: {
      title: string;
    }
  }[];
  nextPost: {
    uid: string;
    data: {
      title: string;
    }
  }[];
}

interface PostProps {
  post: Post;
  preview: boolean;
  navigationPosts: {
    prevPost : {
      uid:string;
      data: {
        title: string;
      }
    }[];
    nextPost : {
      uid:string;
      data: {
        title: string;
      }
    }[];
  };
}

export default function Post({post, navigationPosts, preview}:PostProps) {

  const totalWords = post.data.content.reduce((total, item) => {
    total += item.heading.split(' ').length;

    const words = item.body.map(item => 
      item.text.split(' ').length
    )

    words.map(item => total += item)

    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const dateFormat = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy', 
    {
      locale: ptBR,
    }
  )

  const router = useRouter();

  if(router.isFallback){
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <Head>
        <title>Post | {post.data.title}</title>
      </Head>

      <div className={styles.banner}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>

      <div className={commonStyles.container}>
        <div className={styles.headerPost}>
          <h1>{post.data.title}</h1>
          <div>
            <p><FiCalendar size="22"/> {dateFormat}</p>
            <p><FiUser size="22"/> {post.data.author}</p>
            <p><FiClock size="22"/> {`${readTime} min`}</p>
          </div>
        </div>

        {post.data.content.map(content => (
          <div className={styles.paragraph} key={content.heading}>
            <h3>{content.heading}</h3>
            <div 
              className={styles.contentParagraph}
              dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}
            />
          </div>
        ))}

        <Comments/>

        {preview && (
          <aside className={commonStyles.exitPreviewBtn}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
		    )}
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData
}) => {

  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
    after: response.id,
    orderings: '[document.first_publication_date]'
  })

  const nextPost = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
    after: response.id,
    orderings: '[document.last_publication_date desc]'
  })

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body]
        }
      })
    },
  }


  return {
    props: {
      post,
      preview,
      navigationPosts: {
        prevPost: prevPost.results,
        nextPost: nextPost.results
      }
    },
    redirect: 60 * 30
  }
};
