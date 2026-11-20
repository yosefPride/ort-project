// A `users` document:
//   _id, name, email, password_hash, created_at
//   is_admin   System admin. Only settable from the admin panel (or by hand in the database).

/** What the API shows about a user: everything except the password hash. */
export function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    is_admin: user.is_admin === true,
    created_at: user.created_at,
  };
}
