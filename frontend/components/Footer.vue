<template>
  <div id="footer" class="container-fluid footer mt-4">
    <footer class="text-muted">
      <div class="container">
        <div class="row mt-4 pt-5">
          <div class="col-12 text-center">
            <img
              class="img-fluid"
              src="/img/polkastats_logo_light@2x.png"
              style="max-width: 300px"
            />
          </div>
        </div>
        <div class="row mt-4 pt-5">
          <div
            class="col-xs-12 col-sm-12 col-md-4 mt-2 mb-4 pb-4 mt-sm-2 text-center text-white"
            data-testid="footer-xx-network"
          >
            <a
              href="https://xx.network"
              aria-label="XX Network"
              title="XX Network"
              target="_blank"
            >
              <img
                class="xx-network-logo-footer"
                src="/img/xx-network-dark.svg"
              />
            </a>
            <hr />
            <ul class="list-unstyled social text-center">
              <li class="mr-2">
                <a target="_blank" href="https://wallet.xx.network"
                  >Web wallet</a
                >
              </li>
              <li>
                <a target="_blank" href="https://twitter.com/xx_network">
                  <font-awesome-layers
                    class="xx-social-icon align-middle mt-2 mr-2"
                  >
                    <font-awesome-icon icon="circle" style="color: #84898d" />
                    <font-awesome-icon
                      :icon="['fab', 'twitter']"
                      transform="shrink-6"
                    />
                  </font-awesome-layers>
                </a>
                <a target="_blank" href="https://discord.gg/Y8pCkbK">
                  <font-awesome-layers
                    class="xx-social-icon align-middle mt-2 mr-2"
                  >
                    <font-awesome-icon icon="circle" style="color: #84898d" />
                    <font-awesome-icon
                      :icon="['fab', 'discord']"
                      transform="shrink-6"
                    />
                  </font-awesome-layers>
                </a>
                <a target="_blank" href="https://t.me/xxnetwork">
                  <font-awesome-layers
                    class="xx-social-icon align-middle mt-2 mr-2"
                  >
                    <font-awesome-icon icon="circle" style="color: #84898d" />
                    <font-awesome-icon
                      :icon="['fab', 'telegram-plane']"
                      transform="shrink-6"
                    />
                  </font-awesome-layers>
                </a>
                <a target="_blank" href="https://www.youtube.com/c/xxnetwork">
                  <font-awesome-layers
                    class="xx-social-icon align-middle mt-2 mr-2"
                  >
                    <font-awesome-icon icon="circle" style="color: #84898d" />
                    <font-awesome-icon
                      :icon="['fab', 'youtube']"
                      transform="shrink-6"
                    />
                  </font-awesome-layers>
                </a>
              </li>
            </ul>
          </div>
          <div
            class="col-xs-12 col-sm-12 col-md-4 mt-2 mb-4 pb-4 mt-sm-2 text-center text-white"
            data-testid="footer-polkadot"
          >
            <h3 class="mb-3">PolkaStats</h3>
            <hr />
            <ul class="list-unstyled social text-center">
              <li class="mr-2" data-testid="footer-twitter">
                <a target="_blank" href="https://twitter.com/polkastats">
                  <font-awesome-icon :icon="['fab', 'twitter']" />
                  @PolkaStats
                </a>
              </li>
              <li data-testid="footer-email">
                <a target="_blank" href="mailto:hello@polkastats.io"
                  ><font-awesome-icon icon="envelope" /> hello@polkastats.io</a
                >
              </li>
            </ul>
          </div>
          <div
            class="col-xs-12 col-sm-12 col-md-4 mt-2 mb-4 pb-4 mt-sm-2 text-center text-white"
            data-testid="footer-builtFor"
          >
            <h3 class="mb-3">
              {{ $t('layout.default.built_with') }}
            </h3>
            <hr />
            <a href="https://xxfoundation.org" target="_blank">
              <img
                src="/img/xx-foundation-logo-color.svg"
                class="grant-badge mt-2"
                alt="XX Foundation"
              />
            </a>
          </div>
        </div>
        <p
          class="small pt-4 text-center text-white"
          data-testid="footer-bottom"
        >
          <nuxt-link to="/team">
            {{ $t('layout.default.made_by') }}
          </nuxt-link>
          <span class="mx-2">|</span>
          <a
            href="https://github.com/xx-labs/xxstats"
            aria-label="View source on GitHub"
            title="View source code on GitHub"
            target="_blank"
            data-testid="github"
            ><i class="fab fa-github" />
            {{ $t('layout.default.view_source_code_on_github') }}</a
          >
        </p>
      </div>
    </footer>
    <a
      href="https://github.com/xx-labs/xxstats"
      class="github-corner"
      aria-label="View source on GitHub"
      title="View source code on GitHub"
      target="_blank"
    >
      <svg
        class="github-corner d-none d-md-none d-lg-none d-xl-block"
        width="90"
        height="90"
        viewBox="0 0 250 250"
        style="
          fill: #d75ea1;
          color: #fff;
          position: absolute;
          top: 0;
          border: 0;
          right: 0;
          z-index: 1100;
        "
        aria-hidden="true"
      >
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
        <path
          d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
          fill="currentColor"
          style="transform-origin: 130px 106px"
          class="octo-arm"
        ></path>
        <path
          d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
          fill="currentColor"
          class="octo-body"
        />
      </svg>
    </a>
  </div>
</template>
<script>
export default {}
</script>
