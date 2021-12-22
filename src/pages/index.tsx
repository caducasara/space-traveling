import { GetStaticProps } from 'next';
import Header from '../components/Header';
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiCalendar, FiUser } from "react-icons/fi";
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps ) {

  const formatedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR
        }
      )
    }
  })



  const [posts, setPosts] = useState<Post[]>(formatedPost);

  return (
    <>
      <main className={commonStyles.container}>
        <Header/>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.data.title}>
              <a className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.userDate}>
                  <p> <FiCalendar size="22"/> {post.first_publication_date}</p>
                  <p> <FiUser size="22"/> {post.data.author}</p>
                </div>
              </a>
            </Link>
          ))}
          <button type="button">
            Carregar mais posts
          </button>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    pageSize: 3
  });

  const posts = postsResponse.results.map(post => {
    return { 
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle:post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  }

  return { 
    props:{
      postsPagination
    }
  }
};
