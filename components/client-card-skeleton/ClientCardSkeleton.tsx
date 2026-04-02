import styles from "./ClientCardSkeleton.module.css";

export default function ClientCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.info}>
          <div className={styles.titleRow}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonTag}`} />
          </div>
          <div className={styles.subtitleRow}>
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />
          </div>
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonToggle}`} />
      </div>
    </div>
  );
}
