import './AvatarSelector.css'
import {
  GENERIC_AVATARS,
  GENERIC_AVATAR_KEYS,
  getGenericAvatarComponent,
  isGenericAvatarKey,
} from './GenericAvatars.jsx'

function AvatarSelector({ value = '', onSelect = () => {} }) {
  return (
    <div className="avatar-selector-wrapper">
      <label>
        <span>Avatar</span>
      </label>

      <div className="avatar-selector-grid">
        {GENERIC_AVATAR_KEYS.map((avatarKey) => {
          const avatar = GENERIC_AVATARS[avatarKey]
          const isActive = isGenericAvatarKey(value) && value === avatarKey

          return (
            <button
              key={avatarKey}
              type="button"
              className={`avatar-option ${isActive ? 'avatar-option-active' : ''}`}
              onClick={() => onSelect(avatarKey)}
              title={avatar.label}
            >
              <span className="avatar-option-art">
                {getGenericAvatarComponent(avatarKey, 72)}
              </span>

              <span className="avatar-option-label">
                {avatar.label}
              </span>

              {isActive ? (
                <span className="avatar-option-checkmark">✓</span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="avatar-selector-hint">
        También podés usar una imagen externa pegando una URL abajo.
      </div>
    </div>
  )
}

export default AvatarSelector