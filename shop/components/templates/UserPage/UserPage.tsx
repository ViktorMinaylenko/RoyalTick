'use client'
import { useParams } from 'next/navigation'
import { useUnit } from 'effector-react'
import { $user } from '@/context/user/state'
import { useLang } from '@/hooks/useLang'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/user-page/index.module.scss'
import { useUserData } from '@/hooks/useUserData'
import { useModeratorActions } from '@/hooks/useModeratorActions'
import UserPageHeader from '@/components/modules/UserPage/UserPageHeader'
import UserPageLots from '@/components/modules/UserPage/UserPageLots'
import UserPageReviews from '@/components/modules/UserPage/UserPageReviews'
import UserPageBlockModal from '@/components/modules/UserPage/UserPageBlockModal'
import UserPageReduceModal from '@/components/modules/UserPage/UserPageReduceModal'

const UserPage = () => {
    const { lang, translations } = useLang()
    const t = translations[lang] as any
    const params = useParams()
    const currentUser = useUnit($user) as any

    const {
        userData, setUserData,
        lots, spinner,
        followSpinner, isFollowing, followersCount,
        handleFollow,
    } = useUserData(String(params.id), currentUser?._id)

    const {
        blockSpinner, showBlockModal, setShowBlockModal,
        blockReason, setBlockReason,
        showReduceModal, setShowReduceModal,
        reduceType, setReduceType,
        reduceReason, setReduceReason,
        reduceSpinner, reducePercent, setReducePercent,
        handleBlock, handleReduceRating,
    } = useModeratorActions(String(params.id), setUserData)

    if (spinner) {
        return (
            <main>
                <section style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#b8973f' />
                </section>
            </main>
        )
    }

    if (!userData) return null

    const isOwnProfile = String(currentUser?._id) === String(params.id)
    const isModerator = currentUser?.role === 'moderator' || currentUser?.role === 'admin'

    return (
        <main>
            <section className={styles.user_page}>
                <div className='container'>

                    {userData.isBlocked && (
                        <div className={styles.user_page__block_banner}>
                            <span className={styles.user_page__block_banner__icon}>🔒</span>
                            <div>
                                <p className={styles.user_page__block_banner__title}>
                                    Акаунт заблоковано
                                </p>
                                {userData.blockReason && (
                                    <p className={styles.user_page__block_banner__reason}>
                                        Причина: {userData.blockReason}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <UserPageHeader
                        userData={userData}
                        lots={lots}
                        followersCount={followersCount}
                        isFollowing={isFollowing}
                        followSpinner={followSpinner}
                        isOwnProfile={isOwnProfile}
                        isModerator={isModerator}
                        t={t}
                        onFollow={handleFollow}
                        onBlock={() => handleBlock('')}
                        onShowBlockModal={() => setShowBlockModal(true)}
                        onShowReduceModal={() => setShowReduceModal(true)}
                        blockSpinner={blockSpinner}
                    />

                    <UserPageLots lots={lots} t={t} />

                    <UserPageReviews
                        reviews={userData.sellerReviews}
                        currentUserId={currentUser?._id}
                        lang={lang}
                        t={t}
                    />

                </div>
            </section>

            {showReduceModal && (
                <UserPageReduceModal
                    userName={userData.name}
                    reduceType={reduceType}
                    reduceReason={reduceReason}
                    reducePercent={reducePercent}
                    reduceSpinner={reduceSpinner}
                    onTypeChange={setReduceType}
                    onReasonChange={setReduceReason}
                    onPercentChange={setReducePercent}
                    onClose={() => setShowReduceModal(false)}
                    onConfirm={handleReduceRating}
                />
            )}

            {showBlockModal && (
                <UserPageBlockModal
                    userName={userData.name}
                    blockReason={blockReason}
                    blockSpinner={blockSpinner}
                    onReasonChange={setBlockReason}
                    onClose={() => setShowBlockModal(false)}
                    onConfirm={() => handleBlock(blockReason)}
                />
            )}
        </main>
    )
}

export default UserPage