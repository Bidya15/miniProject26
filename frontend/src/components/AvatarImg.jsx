import { initials, avatarColor } from "../utils/helpers";

/**
 * AvatarImg — renders a profile photo when available, falls back to initials circle.
 *
 * Props:
 *   user      – user object ({ name, avatar, ... })
 *   className – CSS class string (e.g. "avatar avatar-sm")
 *   size      – alternative size shorthand: 'sm'|'md'|'lg'|'xl' (used when className omitted)
 *   style     – extra inline styles
 *   onClick   – optional click handler
 *   title     – optional tooltip
 */
function AvatarImg({ user = {}, className, size, style = {}, onClick, title }) {
    const name = user?.name || "";
    const bg = avatarColor(name);

    // Support both custom className and automated size mapping
    const sizeMap = { sm: "avatar-sm", md: "avatar-md", lg: "avatar-lg", xl: "avatar-xl" };
    const sizeCls = sizeMap[size] || "avatar-md";
    const cls = `avatar ${sizeCls} ${className || ""}`.trim();

    const imgUrl = user?.profileImage || user?.avatar;

    if (imgUrl) {
        return (
            <img
                src={imgUrl}
                alt={name}
                title={title}
                onClick={onClick}
                className={cls}
                style={{ objectFit: "cover", background: bg, ...style }}
            />
        );
    }

    return (
        <div
            className={cls}
            style={{ background: bg, ...style }}
            onClick={onClick}
            title={title}
        >
            {initials(name)}
        </div>
    );
}

export default AvatarImg;