/**
 * Logic điều khiển, hoạt ảnh tương tác và hệ thống chiến đấu thời gian thực
 */

const gameState = {
  player: {
    baseHp: 160,
    baseAtk: 28,
    baseDef: 6,
    gold: 200,
    points: 30,
    tickets: 3,
    activePetId: null,
    pets: [],
    equippedCards: ["card_fire_strike"],
    ownedCards: ["card_fire_strike", "card_life_bloom"]
  },
  combatInterval: null
};

document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  initTabs();
  renderTopStats();
  renderIslands();
  renderMapMonsters();
  renderPets();
  renderDeck();
  initConvene();
  initBattleModal();
});

function saveData() {
  localStorage.setItem("CUU_DAO_SAVE_V2", JSON.stringify(gameState.player));
}

function loadSavedData() {
  const saved = localStorage.getItem("CUU_DAO_SAVE_V2");
  if (saved) {
    try {
      gameState.player = Object.assign(gameState.player, JSON.parse(saved));
    } catch (e) {
      console.error("Lỗi đọc dữ liệu lưu!", e);
    }
  }
}

function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
    });
  });
}

function renderTopStats() {
  const p = gameState.player;
  let bHp = 0, bAtk = 0, bDef = 0;

  p.equippedCards.forEach(cid => {
    const card = CARDS_DATABASE.find(c => c.id === cid);
    if (card && card.statBonus) {
      bHp += card.statBonus.hp || 0;
      bAtk += card.statBonus.atk || 0;
      bDef += card.statBonus.def || 0;
    }
  });

  if (p.activePetId) {
    const pet = p.pets.find(i => i.id === p.activePetId);
    if (pet) {
      bHp += pet.hp;
      bAtk += pet.atk;
      bDef += pet.def;
    }
  }

  const tHp = p.baseHp + bHp;
  const tAtk = p.baseAtk + bAtk;
  const tDef = p.baseDef + bDef;

  document.getElementById("stat-player-hp").innerText = `${tHp}/${tHp}`;
  document.getElementById("stat-player-atk").innerText = tAtk;
  document.getElementById("stat-player-def").innerText = tDef;

  document.getElementById("cur-gold").innerText = p.gold;
  document.getElementById("cur-points").innerText = p.points;
  document.getElementById("cur-tickets").innerText = p.tickets;
  saveData();
}

function renderIslands() {
  const container = document.getElementById("island-list");
  container.innerHTML = "";
  ISLANDS_DATA.forEach(island => {
    const div = document.createElement("div");
    div.className = `island-card ${island.status === 'open' ? 'active' : 'locked'}`;
    div.innerHTML = `
      <h4>${island.name}</h4>
      <span>${island.status === 'open' ? 'Khả Dụng' : 'Khóa'}</span>
    `;
    div.onclick = () => {
      if (island.status !== 'open') {
        alert("Đảo này hiện đang bị phong ấn!");
      }
    };
    container.appendChild(div);
  });
}

function renderMapMonsters() {
  const grid = document.getElementById("boss-grid");
  grid.innerHTML = "";

  MAP1_MONSTERS.forEach(mob => {
    const card = document.createElement("div");
    card.className = `stage-node ${mob.isBoss ? 'is-boss' : ''}`;
    card.innerHTML = `
      <div class="stage-avatar-box">
        <img src="${mob.sprite}" alt="${mob.name}">
      </div>
      <h3>${mob.name}</h3>
      <div style="font-size:0.85rem; color:var(--text-muted);">
        HP: <b>${mob.hp}</b> | ATK: <b>${mob.atk}</b> | DEF: <b>${mob.def}</b>
      </div>
      <button class="btn-primary btn-sm" onclick="startCombat('${mob.id}')">Khiêu Chiến</button>
    `;
    grid.appendChild(card);
  });
}

function renderPets() {
  const container = document.getElementById("pet-container");
  container.innerHTML = "";

  if (gameState.player.pets.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted)">Bạn chưa có Pet. Hãy đánh bại quái tại Đảo Ngọn Cỏ để thu phục!</p>`;
    return;
  }

  gameState.player.pets.forEach(pet => {
    const isSelected = gameState.player.activePetId === pet.id;
    const card = document.createElement("div");
    card.className = `pet-card ${isSelected ? 'selected' : ''}`;
    card.innerHTML = `
      <h3>${pet.name} (Cấp ${pet.level})</h3>
      <p style="color:var(--text-muted)">HP: +${pet.hp} | ATK: +${pet.atk} | DEF: +${pet.def}</p>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button class="btn-primary btn-sm" onclick="togglePetEquip('${pet.id}')">
          ${isSelected ? 'Cho Nghỉ' : 'Xuất Trận'}
        </button>
        <button class="btn-primary btn-sm" style="background:var(--accent-purple);" onclick="upgradePet('${pet.id}')">
          Nâng Cấp (60 Vàng, 15 Tích Lũy)
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.togglePetEquip = function(petId) {
  gameState.player.activePetId = gameState.player.activePetId === petId ? null : petId;
  renderPets();
  renderTopStats();
};

window.upgradePet = function(petId) {
  const p = gameState.player;
  const pet = p.pets.find(i => i.id === petId);
  if (!pet) return;

  if (p.gold >= 60 && p.points >= 15) {
    p.gold -= 60;
    p.points -= 15;
    pet.level += 1;
    pet.hp += 25;
    pet.atk += 5;
    pet.def += 3;
    renderPets();
    renderTopStats();
  } else {
    alert("Không đủ 60 Vàng và 15 Điểm Tích Lũy để nâng cấp!");
  }
};

function renderDeck() {
  const eqList = document.getElementById("equipped-cards-list");
  const ownList = document.getElementById("owned-cards-list");
  eqList.innerHTML = "";
  ownList.innerHTML = "";

  gameState.player.ownedCards.forEach(cid => {
    const card = CARDS_DATABASE.find(c => c.id === cid);
    if (!card) return;

    const isEq = gameState.player.equippedCards.includes(cid);
    const div = document.createElement("div");
    div.className = `badge-card ${card.elementClass}`;
    div.innerHTML = `
      <div class="card-emblem-icon" style="color:${card.color};">
        <i class="fa-solid ${card.icon}"></i>
      </div>
      <h4>${card.name}</h4>
      <p>${card.desc}</p>
      <button class="btn-primary btn-sm" onclick="toggleCard('${card.id}')">
        ${isEq ? 'Tháo Ra' : 'Trang Bị'}
      </button>
    `;

    if (isEq) eqList.appendChild(div);
    else ownList.appendChild(div);
  });
}

window.toggleCard = function(cardId) {
  const p = gameState.player;
  if (p.equippedCards.includes(cardId)) {
    p.equippedCards = p.equippedCards.filter(id => id !== cardId);
  } else {
    if (p.equippedCards.length >= 5) {
      alert("Chỉ được trang bị tối đa 5 thẻ bài cùng lúc!");
      return;
    }
    p.equippedCards.push(cardId);
  }
  renderDeck();
  renderTopStats();
};

function initConvene() {
  const btnT = document.getElementById("btn-roll-ticket");
  const btnP = document.getElementById("btn-roll-point");
  const log = document.getElementById("convene-log");

  btnT.addEventListener("click", () => {
    if (gameState.player.tickets <= 0) {
      alert("Hết Vé Roll!");
      return;
    }
    gameState.player.tickets--;
    rollCard(log);
  });

  btnP.addEventListener("click", () => {
    if (gameState.player.points < 100) {
      alert("Cần tối thiểu 100 Điểm Tích Lũy!");
      return;
    }
    gameState.player.points -= 100;
    rollCard(log);
  });
}

function rollCard(logEl) {
  const unowned = CARDS_DATABASE.filter(c => !gameState.player.ownedCards.includes(c.id));
  if (unowned.length === 0) {
    logEl.innerHTML = `<p style="color:var(--accent-gold);">Toàn bộ huy hiệu thẻ bài đã được mở khóa!</p>`;
    renderTopStats();
    return;
  }
  const picked = unowned[Math.floor(Math.random() * unowned.length)];
  gameState.player.ownedCards.push(picked.id);
  logEl.innerHTML = `<p style="color:var(--accent-green); font-size:1.05rem;">
    Triệu hồi thành công Huy Hiệu: <b>${picked.name}</b>!
  </p>`;
  renderDeck();
  renderTopStats();
}

function initBattleModal() {
  document.getElementById("btn-flee").addEventListener("click", () => {
    clearInterval(gameState.combatInterval);
    document.getElementById("battle-modal").classList.add("hidden");
  });
}

// Logic Trận Đấu Thời Gian Thực & Kỹ Năng Boss Qing
window.startCombat = function(monsterId) {
  const mob = MAP1_MONSTERS.find(m => m.id === monsterId);
  if (!mob) return;

  const modal = document.getElementById("battle-modal");
  modal.classList.remove("hidden");

  let pMaxHp = gameState.player.baseHp;
  let pAtk = gameState.player.baseAtk;
  let pDef = gameState.player.baseDef;

  gameState.player.equippedCards.forEach(cid => {
    const c = CARDS_DATABASE.find(i => i.id === cid);
    if (c && c.statBonus) {
      pMaxHp += c.statBonus.hp || 0;
      pAtk += c.statBonus.atk || 0;
      pDef += c.statBonus.def || 0;
    }
  });

  if (gameState.player.activePetId) {
    const pet = gameState.player.pets.find(pt => pt.id === gameState.player.activePetId);
    if (pet) {
      pMaxHp += pet.hp;
      pAtk += pet.atk;
      pDef += pet.def;
      document.getElementById("p-pet-tag").innerText = `Pet: ${pet.name}`;
    }
  } else {
    document.getElementById("p-pet-tag").innerText = "Chưa mang Pet";
  }

  let curPlayerHp = pMaxHp;
  let curEnemyHp = mob.hp;
  let enemyMaxHp = mob.hp;
  let enemyAtk = mob.atk;
  let enemyDef = mob.def;

  let qingFund = 0;
  let isRecovering = false;
  let recoveryTimer = 0;
  let cooldownTimer = 0;

  const qingMeterBox = document.getElementById("qing-meter-box");
  if (mob.isBoss) {
    qingMeterBox.classList.remove("hidden");
    document.getElementById("qing-fund-bar").style.width = "0%";
    document.getElementById("qing-fund-text").innerText = "0%";
  } else {
    qingMeterBox.classList.add("hidden");
  }

  document.getElementById("enemy-name").innerText = mob.name;
  const enemyImg = document.getElementById("enemy-sprite-img");
  const playerImg = document.getElementById("player-sprite-img");
  enemyImg.src = mob.sprite;

  const logBox = document.getElementById("combat-log");
  logBox.innerHTML = `<div>Bắt đầu nghênh chiến <b>${mob.name}</b>!</div>`;

  clearInterval(gameState.combatInterval);

  gameState.combatInterval = setInterval(() => {
    // 1. Logic Boss Qing (Quỹ Ngọn Cỏ)
    if (mob.isBoss) {
      if (cooldownTimer > 0) cooldownTimer--;

      if (isRecovering) {
        recoveryTimer--;
        // Map Ngọn Cỏ nhận thêm 50% hiệu ứng hồi máu: 5% * 1.5 = 7.5% HP mỗi giây
        const healAmt = Math.floor(enemyMaxHp * 0.075);
        curEnemyHp = Math.min(enemyMaxHp, curEnemyHp + healAmt);
        logBox.innerHTML += `<div style="color:var(--accent-green);">Quỹ Ngọn Cỏ khôi phục sinh lực Boss Qing: +${healAmt} HP!</div>`;

        if (recoveryTimer <= 0) {
          isRecovering = false;
          enemyAtk = mob.atk;
          enemyDef = mob.def;
          document.getElementById("e-buff-tag").classList.add("hidden");
          logBox.innerHTML += `<div>Trạng thái hồi phục của Boss Qing đã kết thúc.</div>`;
        }
      }
    }

    // 2. Hiệp sĩ tấn công quái
    playerImg.classList.add("attack-lunge-right");
    setTimeout(() => playerImg.classList.remove("attack-lunge-right"), 300);

    enemyImg.classList.add("hit-shake");
    setTimeout(() => enemyImg.classList.remove("hit-shake"), 300);

    const pDmg = Math.max(1, pAtk - Math.floor(enemyDef / 2));
    curEnemyHp -= pDmg;
    logBox.innerHTML += `<div>Hiệp sĩ gây <b>${pDmg}</b> sát thương lên đối thủ.</div>`;

    // Khi Boss Qing bị tấn công -> Tích từ 10 - 35% Quỹ
    if (mob.isBoss && !isRecovering && cooldownTimer <= 0) {
      const fundGain = Math.floor(Math.random() * 26) + 10;
      qingFund = Math.min(100, qingFund + fundGain);
      document.getElementById("qing-fund-bar").style.width = `${qingFund}%`;
      document.getElementById("qing-fund-text").innerText = `${qingFund}%`;

      if (qingFund >= 100) {
        qingFund = 0;
        isRecovering = true;
        recoveryTimer = 5;
        cooldownTimer = 20; // Hồi chiêu 20s
        enemyAtk = Math.floor(mob.atk * 1.2); // Tăng 20% ATK
        enemyDef = Math.floor(mob.def * 1.4); // Tăng 40% DEF
        document.getElementById("e-buff-tag").classList.remove("hidden");
        logBox.innerHTML += `<div style="color:var(--accent-gold); font-weight:bold;">
          Quỹ Ngọn Cỏ kích hoạt! Qing liên tục hồi phục, nhận +20% ATK & +40% DEF trong 5s!
        </div>`;
      }
    }

    // Kiểm tra quái chết
    if (curEnemyHp <= 0) {
      curEnemyHp = 0;
      refreshCombatUI();
      clearInterval(gameState.combatInterval);
      handleVictory(mob);
      return;
    }

    // 3. Quái tấn công Hiệp sĩ
    setTimeout(() => {
      if (curEnemyHp <= 0) return;

      enemyImg.classList.add("attack-lunge-left");
      setTimeout(() => enemyImg.classList.remove("attack-lunge-left"), 300);

      playerImg.classList.add("hit-shake");
      setTimeout(() => playerImg.classList.remove("hit-shake"), 300);

      const eDmg = Math.max(1, enemyAtk - Math.floor(pDef / 2));
      curPlayerHp -= eDmg;
      logBox.innerHTML += `<div style="color:var(--accent-red);">Đối thủ đánh trả gây <b>${eDmg}</b> sát thương!</div>`;

      if (curPlayerHp <= 0) {
        curPlayerHp = 0;
        refreshCombatUI();
        clearInterval(gameState.combatInterval);
        logBox.innerHTML += `<div style="color:var(--accent-red); font-weight:bold;">Bạn đã bị đánh bại! Nâng cấp trang bị hoặc Pet trước khi thử lại.</div>`;
      }
      refreshCombatUI();
    }, 450);

    refreshCombatUI();
  }, 1000);

  function refreshCombatUI() {
    document.getElementById("p-hp-bar").style.width = `${(curPlayerHp / pMaxHp) * 100}%`;
    document.getElementById("p-hp-text").innerText = `${curPlayerHp} / ${pMaxHp}`;
    document.getElementById("e-hp-bar").style.width = `${(curEnemyHp / enemyMaxHp) * 100}%`;
    document.getElementById("e-hp-text").innerText = `${curEnemyHp} / ${enemyMaxHp}`;
    logBox.scrollTop = logBox.scrollHeight;
  }
};

function handleVictory(mob) {
  const p = gameState.player;
  p.gold += mob.rewardGold;
  let msg = `Chiến thắng rực rỡ! Nhận được ${mob.rewardGold} Vàng. `;

  if (mob.isBoss) {
    p.tickets += mob.rewardTickets || 0;
    p.points += mob.rewardPoints || 0;
    msg += `Nhận thêm ${mob.rewardTickets} Vé Roll và ${mob.rewardPoints} Điểm Tích Lũy!`;
  }

  if (mob.petDrop) {
    const exists = p.pets.find(i => i.name === mob.petDrop.name);
    if (!exists) {
      p.pets.push({
        id: "pet_" + Date.now(),
        name: mob.petDrop.name,
        level: 1,
        hp: mob.petDrop.hp,
        atk: mob.petDrop.atk,
        def: mob.petDrop.def
      });
      msg += ` Đã thu phục được Linh Thú: ${mob.petDrop.name}!`;
    }
  }

  alert(msg);
  renderTopStats();
  renderPets();
  saveData();
}
