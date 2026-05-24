import styles from '@/styles/community/index.module.scss'
import { ITagsInputProps } from '@/types/auction'

const TagsInput = ({
    tags, tagInput, placeholder,
    onTagInputChange, onAddTag, onRemoveTag,
    inputClassName, tagClassName, tagsWrapperClassName,
}: ITagsInputProps) => (
    <>
        <input
            className={inputClassName}
            placeholder={placeholder}
            value={tagInput}
            onChange={e => onTagInputChange(e.target.value)}
            onKeyDown={onAddTag}
        />
        {tags.length > 0 && (
            <div className={tagsWrapperClassName}>
                {tags.map(tag => (
                    <span key={tag} className={tagClassName}>
                        {tag}
                        <button
                            className='btn-reset'
                            onClick={() => onRemoveTag(tag)}
                            style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.6 }}
                        >
                            ✕
                        </button>
                    </span>
                ))}
            </div>
        )}
    </>
)

export default TagsInput