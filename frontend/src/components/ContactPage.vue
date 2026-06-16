<template>
  <div class="contact-page min-h-screen px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <header class="contact-hero mb-6 overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
        <div class="contact-hero__glow"></div>
        <div class="relative p-6 sm:p-8 lg:p-10">
          <p class="contact-kicker">Atbalsts</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Sazinies ar mums</h1>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
            Mēs palīdzam ar konta jautājumiem, tehniskām problēmām un ieteikumiem par platformas uzlabojumiem.
          </p>
        </div>
      </header>

      <div class="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <section class="contact-card p-6 sm:p-7">
          <h2 class="text-xl font-extrabold text-slate-900">Kontaktinformācija</h2>
          <p class="mt-2 text-sm text-slate-600">Atbildam pēc iespējas ātrāk darba laikā.</p>

          <div class="mt-5 space-y-3">
            <div class="info-row">
              <span class="info-label">E-pasts</span>
              <span class="info-value">support@eiroplaza.lv</span>
            </div>
            <div class="info-row">
              <span class="info-label">Atbalsta laiks</span>
              <span class="info-value">P.-Pk. 09:00-18:00</span>
            </div>
            <div class="info-row">
              <span class="info-label">Atbildes laiks</span>
              <span class="info-value">Parasti 24h laikā</span>
            </div>
          </div>

          <button
            @click="goBack"
            class="mt-6 inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Atpakaļ uz sākumlapu
          </button>
        </section>

        <section class="contact-card p-6 sm:p-7">
          <div v-if="isLoggedIn">
            <h2 class="text-xl font-extrabold text-slate-900">Nosūtīt pieprasījumu</h2>
            <p class="mt-2 text-sm text-slate-600">
              Sveicināts, <span class="font-semibold text-slate-800">{{ user?.username || 'lietotāj' }}</span>.
              Apraksti savu jautājumu un mēs ar tevi sazināsimies.
            </p>

            <form @submit.prevent="submitInquiry" class="mt-5 space-y-4">
              <div>
                <label for="inquiry" class="block text-sm font-semibold text-slate-700">Tavs jautājums</label>
                <textarea
                  id="inquiry"
                  v-model="inquiry"
                  rows="6"
                  class="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Lūdzu, apraksti savu jautājumu šeit..."
                ></textarea>
                <p class="mt-2 text-xs text-slate-500">{{ inquiryLength }} rakstzīmes</p>
              </div>

              <div
                v-if="submitState.message"
                class="rounded-xl border px-4 py-3 text-sm"
                :class="submitState.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'"
              >
                {{ submitState.message }}
              </div>

              <button
                type="submit"
                :disabled="isSubmitting || !inquiry.trim()"
                class="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {{ isSubmitting ? 'Nosūta...' : 'Nosūtīt pieprasījumu' }}
              </button>
            </form>
          </div>

          <div v-else class="text-center">
            <h2 class="text-xl font-extrabold text-slate-900">Pieslēdzies, lai rakstītu mums</h2>
            <p class="mt-2 text-sm text-slate-600">
              Lai iesniegtu pieprasījumu, vispirms ielogojies savā kontā.
            </p>
            <button
              @click="goToLogin"
              class="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
            >
              Pieslēgties
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  name: 'ContactPage',
  data() {
    return {
      inquiry: '',
      isSubmitting: false,
      submitState: {
        type: '',
        message: ''
      }
    }
  },
  computed: {
    ...mapState(['isLoggedIn', 'user']),
    inquiryLength() {
      return this.inquiry.length;
    }
  },
  methods: {
    goBack() {
      this.$router.push('/');
    },
    goToLogin() {
      this.$router.push('/login');
    },
    resetSubmitState() {
      this.submitState = {
        type: '',
        message: ''
      };
    },
    async submitInquiry() {
      const message = this.inquiry.trim();
      if (!message) {
        this.submitState = {
          type: 'error',
          message: 'Lūdzu, ievadi jautājuma tekstu.'
        };
        return;
      }

      try {
        this.isSubmitting = true;
        this.resetSubmitState();

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        await axios.post('/api/inquiries', { message }, { headers });

        this.inquiry = '';
        this.submitState = {
          type: 'success',
          message: 'Tavs jautājums ir veiksmīgi nosūtīts.'
        };
      } catch (error) {
        console.error('Kļūda, sūtot jautājumu:', error);
        const apiMessage = error?.response?.data?.message;
        this.submitState = {
          type: 'error',
          message: apiMessage || 'Nosūtot jautājumu radās kļūda. Lūdzu, mēģini vēlreiz.'
        };
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
.contact-page {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.24), transparent 30%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.14), transparent 25%),
    linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #7c3aed 100%);
}

.contact-hero {
  position: relative;
  isolation: isolate;
}

.contact-hero__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.26), transparent 24%),
    radial-gradient(circle at 85% 10%, rgba(168, 85, 247, 0.25), transparent 25%);
  pointer-events: none;
}

.contact-kicker {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  padding: 0.35rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
}

.contact-card {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(14px);
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  padding: 0.8rem 0.95rem;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.info-label {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.info-value {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

@media (max-width: 520px) {
  .info-row {
    flex-direction: column;
  }
}
</style>