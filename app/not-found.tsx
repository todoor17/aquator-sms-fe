import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.glitch} data-text="404">404</div>
        <h2 className={styles.title}>Pagina nu a fost gasita</h2>
        <p className={styles.description}>
          Ruta pe care ai accesat-o nu exista sau a fost mutata.
        </p>
        <Link href="/home" className={styles.button}>
          Inapoi la pagina principala
        </Link>
      </div>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
    </div>
  );
}
