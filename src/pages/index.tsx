import { GetStaticProps } from 'next';
import { Head } from 'next/document';
import Header from '../components/Header';
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiCalendar, FiUser } from "react-icons/fi";

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

export default function Home() {
  return (
    <>
      <main className={commonStyles.container}>
        <Header/>
        <div className={styles.posts}>
          <Link href="/">
            <a className={styles.post}>
              <strong>Titulo do post</strong>
              <p>Breve descrição sobre o post.</p>
              <div className={styles.userDate}>
                <p> <FiCalendar size="22"/> 21 dez 2021</p>
                <p> <FiUser size="22"/> Carlos Casara</p>
              </div>
            </a>
          </Link>

          <Link href="/">
            <a className={styles.post}>
              <strong>Titulo do post</strong>
              <p>Breve descrição sobre o post.</p>
              <div className={styles.userDate}>
                <p> <FiCalendar size="22"/> 21 dez 2021</p>
                <p> <FiUser size="22"/> Carlos Casara</p>
              </div>
            </a>
          </Link>
          <button type="button">
            Carregar mais posts
          </button>
        </div>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
