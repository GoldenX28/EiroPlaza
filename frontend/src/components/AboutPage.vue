<template>
  <div class="about-page min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_32%),linear-gradient(135deg,_#2563eb_0%,_#4f46e5_52%,_#7c3aed_100%)] px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <section class="about-hero mb-6 overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur">
        <div class="relative p-6 sm:p-8 lg:p-10">
          <div>
            <p class="about-kicker text-indigo-600">Par EiroPlaza</p>
            <h1 class="mt-3 max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Eiropas valstu pasaule vienā vietā
            </h1>
            <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              EiroPlaza palīdz ātri atrast uzticamu informāciju par Eiropas valstīm, salīdzināt tās un atklāt jaunas vietas ceļošanai, mācībām vai vienkāršai ziņkārei.
            </p>

            <div class="mt-6 flex flex-wrap gap-3">
              <span class="about-pill">Valstu profili</span>
              <span class="about-pill">Laika joslas</span>
              <span class="about-pill">Valodas un fakti</span>
              <span class="about-pill">Ceļojumu iedvesma</span>
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              <button @click="goBack" class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700">
                Atpakaļ uz sākumlapu
              </button>
              <router-link to="/posts" class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50">
                Skatīt ierakstus
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-3">
        <article class="about-card rounded-3xl bg-white/95 p-6 shadow-xl border border-white/60 backdrop-blur">
          <p class="about-section-kicker">Ko piedāvājam</p>
          <h2 class="about-section-title">Skatāma un saprotama informācija</h2>
          <p class="about-copy">
            Platformā atradīsi pārskatāmus valstu profilus ar galvenajiem faktiem, valodām, galvaspilsētām, valūtām un citu būtisku informāciju.
          </p>
        </article>

        <article class="about-card rounded-3xl bg-white/95 p-6 shadow-xl border border-white/60 backdrop-blur">
          <p class="about-section-kicker">Kāpēc tas noder</p>
          <h2 class="about-section-title">Salīdzini un atrodi ātri</h2>
          <p class="about-copy">
            EiroPlaza ir veidots tā, lai vari ātri salīdzināt valstis, iedvesmoties no citu lietotāju ierakstiem un atrast sev interesējošo bez liekas meklēšanas.
          </p>
        </article>

        <article class="about-card rounded-3xl bg-white/95 p-6 shadow-xl border border-white/60 backdrop-blur">
          <p class="about-section-kicker">Mēs attīstāmies</p>
          <h2 class="about-section-title">Sistēma tiek regulāri uzlabota</h2>
          <p class="about-copy">
            Mēs nepārtraukti papildinām datus un pilnveidojam pieredzi, lai platforma būtu ērta, ātra un noderīga arī turpmāk.
          </p>
        </article>
      </section>

      <section class="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div class="about-card rounded-3xl bg-white/95 p-6 shadow-xl border border-white/60 backdrop-blur">
          <p class="about-section-kicker">Mūsu iespējas</p>
          <h2 class="about-section-title">Ko vari darīt EiroPlaza</h2>
          <ul class="about-list">
            <li>Detalizēti valstu profili</li>
            <li>Aktuāla informācija par valodām un laika joslām</li>
            <li>Kultūras ieskati un ceļojumu ieraksti</li>
            <li>Viegli lietojams un moderns interfeiss</li>
          </ul>
        </div>

        <div class="about-card rounded-3xl bg-white/95 p-6 shadow-xl border border-white/60 backdrop-blur">
          <p class="about-section-kicker">Par mums</p>
          <h2 class="about-section-title">Radīts, lai Eiropa būtu tuvāk</h2>
          <p class="about-copy">
            EiroPlaza ir vieta, kur apkopota noderīga informācija par Eiropu vienā platformā. Tā ir veidota cilvēkiem, kuri vēlas ātri saprast valstu atšķirības, sagatavoties ceļojumam vai vienkārši uzzināt vairāk par pasauli sev apkārt.
          </p>
          <p class="about-copy mt-4">
            Ja tev ir idejas uzlabojumiem vai esi pamanījis kādu datu neprecizitāti, ar administratora paneli to var viegli pārskatīt un sakārtot.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'AboutPage',
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.push('/');
    };

    return {
      goBack
    };
  }
}
</script>