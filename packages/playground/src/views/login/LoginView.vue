<script lang="ts" setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const login = () => {
  // Handle login logic here
  console.log('Logging in with:', { email: email.value, password: password.value, rememberMe: rememberMe.value })
}
</script>

<template>
  <div class="w-full h-screen p-10 flex gap-6">
    <div class="w-full h-full bg-gradient-to-br from-20% from-cyan-500 to-cyan-900 rounded-4xl flex items-center justify-center">
      <div class="text-white text-center p-10">
        <h1 class="text-4xl font-bold mb-4">Welcome Back</h1>
        <p class="text-xl opacity-80">Sign in to continue your journey</p>
      </div>
    </div>
    <div class="w-full flex items-center justify-center">
      <div class="w-full max-w-md p-8">
        <div class="mb-10">
          <h2 class="text-3xl font-bold mb-2">Login</h2>
          <p class="text-gray-500">Please enter your credentials to continue</p>
        </div>
        
        <form @submit.prevent="login" class="space-y-6">
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium">Email</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              placeholder="name@example.com" 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <label for="password" class="block text-sm font-medium">Password</label>
              <a href="#" class="text-sm text-cyan-600 hover:underline">Forgot password?</a>
            </div>
            <input 
              id="password" 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          
          <div class="flex items-center">
            <input 
              id="remember" 
              v-model="rememberMe" 
              type="checkbox" 
              class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
            />
            <label for="remember" class="ml-2 block text-sm text-gray-700">Remember me</label>
          </div>
          
          <button 
            type="submit" 
            class="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          >
            Sign in
          </button>
        </form>
        
        <div class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-3 gap-3">
            <button class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clip-rule="evenodd" />
              </svg>
            </button>
            <button class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10zm6.071 5.385l-1.414-1.414L10 8.586 5.343 3.929 3.929 5.343 8.586 10l-4.657 4.657 1.414 1.414L10 11.414l4.657 4.657 1.414-1.414L11.414 10l4.657-4.615z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <p class="mt-8 text-center text-sm text-gray-500">
          Don't have an account?
          <a href="#" class="font-medium text-cyan-600 hover:text-cyan-500">Sign up</a>
        </p>
      </div>
    </div>
  </div>
</template>