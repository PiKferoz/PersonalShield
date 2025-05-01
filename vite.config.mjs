export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['@solana/web3.js']
    }
  }
});
