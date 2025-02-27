import { LitElement, html, css } from "lit";

const supportsMediaPlayerKefSourceFeature = (stateObj) => {
  const domain = stateObj.entity_id.split(".")[0];
  return domain === "media_player";
};

const sources = {
  "wifi": { icon: "mdi:wifi" },
  "bluetooth": { icon: "mdi:bluetooth" },
  "tv": { icon: "mdi:television" },
  "optical": { icon: "mdi:toslink" },
  "usb": { icon: "mdi:usb" },
}

class MediaSourcesTileCardFeature extends LitElement {
  static get properties() {
    return {
      hass: undefined,
      config: undefined,
      stateObj: undefined,
    };
  }

  static getStubConfig() {
    return {
      type: "custom:media-player-kef-source-feature",
      source_list: Object.keys(sources),
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  _powerOff(ev) {
    ev.stopPropagation();

    this.hass.callService("media_player", "turn_off", {
      entity_id: this.stateObj.entity_id,
    })
  }

  _switchSource(ev, source) {
    ev.stopPropagation();

    this.hass.callService("media_player", "select_source", {
      entity_id: this.stateObj.entity_id,
      source,
    });
  }

  render() {
    if (
      !this.config ||
      !this.hass ||
      !this.stateObj ||
      !supportsMediaPlayerKefSourceFeature(this.stateObj)
    ) {
      return null;
    }

    const selectableSources = this.config.source_list ?? Object.keys(sources);
    const currentSource = this.stateObj.attributes.source ??
      this.stateObj.state ??
      "undefined";

    return html`
      <div class="select">
        ${selectableSources
        .filter(key => sources[key])
        .map((key) => {
          return html`
            <div id="option-${key}" @click="${(ev) => this._switchSource(ev, key)}" class="option ${currentSource == key ? "selected" : ""}">
              <ha-icon class="icon" icon=${sources[key].icon}></ha-icon>
            </div>
          `
        })}
        <div id = "option-off" @click="${this._powerOff}" class="option ${currentSource == "off" ? "selected" : ""}" >
          <ha-icon class="icon" icon="mdi:power"></ha-icon>
        </div>
      </div>
      `;
  }

  static get styles() {
    return css`
    #option-wifi {
      --selected-item-color: #4DAF51;
    }
    #option-bluetooth {
      --selected-item-color: #2295F2;
    }
    #option-tv {
      --selected-item-color: #00BCD4;
    }
    #option-optical {
      --selected-item-color: #916BC6;
    }
    #option-usb {
      --selected-item-color: #FF9800;
    }

    .select {
      display: flex;
      border-radius: var(--feature-border-radius, 12px);
      border: none;
      background-color: #242424;
    }
    .icon {
      --mdc-icon-size: 20px;
    }
    .option {
      display: flex;
      align-items: center;
      justify-content: center;
      height: var(--feature-height, 42px);
      width: 100%;
      border-radius: inherit;
      border: none;
      cursor: pointer;
      transition: background-color 180ms ease-in-out;
    }
    .selected {
      background-color: var(--selected-item-color, #9E9E9E);
    }
    .selected.icon {
      color: white;
    }
    .option:hover:not(.selected) {
      background-color: #3D3D3D;
    }
    .button:focus {
      background-color: #111111;
    }
    `;
  }
}

customElements.define("media-player-kef-source-feature", MediaSourcesTileCardFeature);

window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
  type: "media-player-kef-source-feature",
  name: "Media player",
  supported: supportsMediaPlayerKefSourceFeature,
  configurable: true
});
