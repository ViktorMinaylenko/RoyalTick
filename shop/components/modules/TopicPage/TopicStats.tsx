import styles from '@/styles/community/index.module.scss'
import { IPropsTopicStats } from '@/types/community'


const TopicStats = ({ topic, isLiked, likesCount, likeSpinner, onLike }: IPropsTopicStats) => (
    <div className={styles.topic__stats}>
        <span>👁 {topic.views}</span>
        <span>💬 {topic.messages?.length ?? 0}</span>
        <button
            className={`btn-reset ${styles.topic__like_btn} ${isLiked ? styles.topic__like_btn_active : ''}`}
            onClick={onLike}
            disabled={likeSpinner}
        >
            {likeSpinner ? '...' : `👍 ${likesCount}`}
        </button>
    </div>
)

export default TopicStats