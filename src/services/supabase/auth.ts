import supabase from './client';
import type { AuthError, AuthResponse } from '@supabase/supabase-js';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = LoginCredentials & {
  nickname?: string;
  mobile?: string;
  gender?: number;
};

/**
 * 用户登录
 */
export const signIn = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { email, password } = credentials;
  return supabase.auth.signInWithPassword({
    email,
    password
  });
};

/**
 * 用户注册
 */
export const signUp = async (data: RegisterData): Promise<AuthResponse> => {
  const { email, password, nickname, mobile, gender } = data;
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        mobile,
        gender,
      }
    }
  });
};

/**
 * 用户登出
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  return supabase.auth.signOut();
};

/**
 * 获取当前登录用户
 */
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};

/**
 * 获取当前用户会话
 */
export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

/**
 * 重置密码邮件
 */
export const resetPassword = async (email: string) => {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

/**
 * 修改密码
 */
export const updatePassword = async (newPassword: string) => {
  return supabase.auth.updateUser({
    password: newPassword
  });
};

export default {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getSession,
  resetPassword,
  updatePassword
}; 