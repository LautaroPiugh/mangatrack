import { getGenericAvatarComponent } from './GenericAvatars.jsx'

const getUserInitial = (user) => {
  if (typeof user === 'string') {
    return user.trim().slice(0, 1).toUpperCase() || '?'
  }

  return (
    user?.displayName?.trim()?.slice(0, 1)?.toUpperCase()
    || user?.username?.trim()?.slice(0, 1)?.toUpperCase()
    || user?.name?.trim()?.slice(0, 1)?.toUpperCase()
    || user?.email?.trim()?.slice(0, 1)?.toUpperCase()
    || '?'
  )
}

function UserAvatar({ user, size = 40 }) {
  const avatar = getGenericAvatarComponent(user?.avatar, size)

  if (avatar) {
    return avatar
  }

  return (
    <div className="avatar-fallback">
      {getUserInitial(user)}
    </div>
  )
}

export default UserAvatar
