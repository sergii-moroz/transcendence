export interface RegisterInputProps {
	username: string
	password: string
	repeated: string
}

export interface ResetPasswordProps {
	currentPassword: string
	password: string
	repeated: string
}

export interface PasswordResetIntent {
	temp_token: string
	user_id: number
	hashed_password: string
	created_at: number
	expires_at: number
}
