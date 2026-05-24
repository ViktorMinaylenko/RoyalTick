import { IPhotoUploadGridProps } from "@/types/auction"

const PhotoUploadGrid = ({
    count = 4,
    previews,
    onChange,
    thumbClassName,
    thumbIconClassName,
    wrapperClassName,
}: IPhotoUploadGridProps) => (
    <div className={wrapperClassName}>
        {Array.from({ length: count }).map((_, i) => (
            <label key={i} className={thumbClassName}>
                <input
                    type='file'
                    accept='image/*'
                    onChange={e => onChange(i, e)}
                />
                {previews[i] ? (
                    <img src={previews[i]!} alt={`photo-${i}`} />
                ) : (
                    <span className={thumbIconClassName}>+</span>
                )}
            </label>
        ))}
    </div>
)

export default PhotoUploadGrid