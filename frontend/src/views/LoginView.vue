<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const errorMsg = ref('')

function loginWithDiscord() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID
  if (!clientId) {
    errorMsg.value = 'Discord login is not configured yet. Add VITE_DISCORD_CLIENT_ID to your environment.'
    return
  }
  const state = crypto.randomUUID()
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/auth/discord/callback`
  sessionStorage.setItem('discord_oauth_state', state)
  sessionStorage.setItem('auth_redirect', route.query.redirect || '/')
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'identify email',
    state,
  })
  window.location.assign(`https://discord.com/oauth2/authorize?${params}`)
}
</script>

<template>
  <main class="auth-screen">
    <div class="ambient ambient-one" />
    <div class="ambient ambient-two" />
    <nav class="landing-nav">
      <a href="https://ixeriox.dev" class="wordmark" aria-label="iXeriox home">
        <span class="logo-glyph">iX</span><span>Music</span>
      </a>
      <a href="https://ixeriox.dev" class="portfolio-link">iXeriox.dev <span>↗</span></a>
    </nav>

    <section class="login-copy">
      <p class="eyebrow"><span /> YOUR MUSIC, YOUR SPACE</p>
      <h1>Every sound.<br><em>One wavelength.</em></h1>
      <p class="lede">A focused place for the tracks you love. Stream, collect, and follow every lyric without the noise.</p>

      <button class="discord-btn" @click="loginWithDiscord">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.5 5.3A16.3 16.3 0 0015.4 4l-.5 1.1a15 15 0 00-5.8 0L8.6 4a16.7 16.7 0 00-4.1 1.3C1.9 9.1 1.2 12.8 1.6 16.4a16.8 16.8 0 005 2.5l1.2-1.7c-.7-.3-1.3-.6-1.9-1 .2.1.3.2.5.2 3.7 1.7 7.7 1.7 11.4 0l.5-.2c-.6.4-1.2.7-1.9 1l1.2 1.7a16.7 16.7 0 005-2.5c.5-4.2-.8-7.8-3.1-11.1zM8.9 14.4c-1 0-1.9-1-1.9-2.2S7.8 10 8.9 10s1.9 1 1.9 2.2-.9 2.2-1.9 2.2zm6.2 0c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2z"/></svg>
        Continue with Discord
        <span class="arrow">→</span>
      </button>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <p class="fine-print">By continuing, you agree to keep the volume at a reasonable level.</p>
    </section>

    <div class="visual-card">
      <div class="orbit orbit-a"/><div class="orbit orbit-b"/>
      <div class="disc"><div class="disc-ring"/><div class="disc-label">iX<br><small>MUSIC</small></div></div>
      <div class="sound-bars"><span v-for="n in 18" :key="n" :style="{ '--n': n }" /></div>
      <p>PLAY WHAT MOVES YOU</p>
    </div>
    <footer>Designed in the frequency of <a href="https://ixeriox.dev">iXeriox</a></footer>
  </main>
</template>

<style scoped>
.auth-screen { min-height: 100%; position: relative; overflow: hidden; padding: 34px clamp(28px, 6vw, 92px); background: #08090d; isolation: isolate; }
.ambient { position: absolute; border-radius: 50%; filter: blur(100px); opacity: .16; z-index: -1; }.ambient-one { width: 500px; height: 500px; background: #7657ff; top: -280px; right: 8%; }.ambient-two { width: 400px; height: 400px; background: #d043ff; bottom: -300px; left: 20%; }
.landing-nav { display: flex; align-items: center; justify-content: space-between; }.wordmark { display: flex; align-items: center; gap: 10px; font: 700 19px var(--font-display); }.logo-glyph { width: 35px; height: 35px; display: grid; place-items: center; color: #09090d; background: #f5f3ff; border-radius: 10px; font-size: 14px; }.portfolio-link { color: #8e8d9b; font-size: 13px; border-bottom: 1px solid #33333d; padding-bottom: 4px; }
.login-copy { position: relative; z-index: 2; width: min(570px, 48vw); margin-top: clamp(110px, 17vh, 185px); }.eyebrow { color: #9b8aff; font-size: 11px; font-weight: 700; letter-spacing: .18em; display: flex; align-items: center; gap: 10px; }.eyebrow span { width: 25px; height: 1px; background: #8069ff; }
h1 { font-size: clamp(52px, 6.2vw, 92px); line-height: .95; letter-spacing: -.065em; margin: 22px 0 28px; font-weight: 650; }h1 em { color: #9a84ff; font-style: normal; font-weight: 450; }.lede { max-width: 470px; color: #8e8d99; font-size: 16px; line-height: 1.7; }
.discord-btn { margin-top: 38px; width: min(370px, 100%); height: 58px; border: 0; border-radius: 12px; padding: 0 18px; display: flex; align-items: center; gap: 13px; color: white; background: #5865f2; font-size: 14px; font-weight: 700; box-shadow: 0 14px 40px rgba(88,101,242,.2); transition: transform .2s, background .2s, box-shadow .2s; }.discord-btn:hover { background: #6975f5; transform: translateY(-2px); box-shadow: 0 18px 48px rgba(88,101,242,.28); }.discord-btn svg { width: 23px; }.discord-btn .arrow { margin-left: auto; font-size: 20px; }.error-msg { margin-top: 14px; color: #ff7890; font-size: 13px; max-width: 420px; }.fine-print { color: #51515c; font-size: 10px; margin-top: 18px; }
.visual-card { position: absolute; width: min(42vw, 620px); aspect-ratio: 1; right: 4vw; top: 19vh; display: grid; place-items: center; }.orbit { position: absolute; border: 1px solid rgba(154,132,255,.14); border-radius: 50%; }.orbit-a { inset: 2%; }.orbit-b { inset: 13%; border-style: dashed; animation: spin 30s linear infinite; }.disc { width: 52%; aspect-ratio: 1; border-radius: 50%; position: relative; display: grid; place-items: center; background: repeating-radial-gradient(circle, #15151c 0 3px, #0b0c10 4px 8px); box-shadow: 0 20px 80px #000, inset 0 0 40px rgba(154,132,255,.13); animation: spin 18s linear infinite; }.disc-ring { position: absolute; inset: 30%; border-radius: 50%; background: #8b73ff; box-shadow: 0 0 50px rgba(139,115,255,.5); }.disc-label { z-index: 1; text-align: center; color: white; font: 700 22px var(--font-display); line-height: .7; }.disc-label small { font-size: 7px; letter-spacing: .25em; }.sound-bars { position: absolute; bottom: 8%; display: flex; align-items: center; gap: 4px; height: 50px; }.sound-bars span { width: 3px; height: calc(7px + (var(--n) % 7) * 5px); border-radius: 4px; background: #846eff; opacity: calc(.3 + (var(--n) % 5) * .12); }.visual-card>p { position: absolute; bottom: -2%; color: #5f5d6b; letter-spacing: .24em; font-size: 9px; }footer { position: absolute; bottom: 30px; color: #45444f; font-size: 11px; }footer a { color: #777483; }
@keyframes spin { to { transform: rotate(360deg); } }
@media(max-width: 850px) { .visual-card { opacity: .2; width: 90vw; right: -35vw; top: 21vh; }.login-copy { width: 100%; margin-top: 18vh; } h1 { font-size: clamp(52px, 15vw, 76px); }.portfolio-link { display:none; } }
</style>
