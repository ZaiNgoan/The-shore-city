/**
 * Quản lý trạng thái và logic vận hành trò chơi
 */

const gameState = {
  player: {
    baseHp: 150,
    baseAtk: 25,
    baseDef: 5,
    gold: 200,
    points: 30,
    tickets: 3,
    activePetId: null,
    pets: [],
    equippedCards: ["card_basic_atk"],
    ownedCards: ["card_basic_atk", "card_basic_hp"]
  },
  currentEnemy: null,
  combatInterval: null
};

// Khởi chạy khi load xong DOM
document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  initTabs();
  renderTopStats();
  renderIslands();
  renderMapMonsters();
  renderPets();
  renderDeck();
  initConveneActions();
  initBattleModal();
});

// Lưu / Tải localStorage
function saveData() {
  localStorage.setItem("CUU_DAO_SAVE", JSON.stringify(gameState.player));
}

function loadSavedData() {
  const saved = localStorage.getItem("CUU_DAO_SAVE");
  if (saved) {
    try {
      gameState.player = Object.assign(gameState.player, JSON.parse(saved));
    } catch (e) {
      console.error("Lỗi đọc dữ liệu save", e);
    }
  }
}

// Chuyển Tab
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
    });
  });
}

// Cập nhật thanh hiển thị tài nguyên
function renderTopStats() {
  const p = gameState.player;
  let bonusHp = 0, bonusAtk = 0, bonusDef = 0;

  // Cộng chỉ số từ thẻ bài
  p.equippedCards.forEach(cid => {
    const card = CARDS_DATABASE.find(c => c.id === cid);
    if (card && card.statBonus) {
      bonusHp += card.statBonus.hp || 0;
      bonusAtk += card.statBonus.atk || 0;
      bonusDef += card.statBonus.def || 0;
    }
  });

  // Cộng chỉ số từ pet đang đồng hành
  if (p.activePetId) {
    const pet = p.pets.find(pet => pet.id === p.activePetId);
    if (pet) {
      bonusHp += pet.hp;
      bonusAtk += pet.atk;
      bonusDef += pet.def;
    }
  }

  const totalHp = p.baseHp + bonusHp;
  const totalAtk = p.baseAtk + bonusAtk;
  const totalDef = p.baseDef + bonusDef;

  document.getElementById("stat-player-hp").innerText = `${totalHp}/${totalHp}`;
  document.getElementById("stat-player-atk").innerText = totalAtk;
  document.getElementById("stat-player-def").innerText = totalDef;

  document.getElementById("cur-gold").innerText = p.gold;
  document.getElementById("cur-points").innerText = p.points;
  document.getElementById("cur-tickets").innerText = p.tickets;
  saveData();
}

// Render 9 Đảo
function renderIslands() {
  const container = document.getElementById("island-list");
  container.innerHTML = "";
  ISLANDS_DATA.forEach(island => {
    const div = document.createElement("div");
    div.className = `island-card ${island.status === 'open' ? 'active' : 'locked'}`;
    div.innerHTML = `
      <h4>${island.name}</h4>
      <span>${island.status === 'open' ? 'Đang mở' : 'Đang khóa'}</span>
    `;
    div.onclick = () => {
      if (island.status === 'open') {
        document.getElementById("current-island-title").innerText = island.name;
        document.getElementById("current-island-desc").innerText = island.desc;
      } else {
        alert("Hòn đảo này hiện chưa mở khóa!");
      }
    };
    container.appendChild(div);
  });
}

// Render 6 Quái/Boss tại Map 1
function renderMapMonsters() {
  const grid = document.getElementById("boss-grid");
  grid.innerHTML = "";

  MAP1_MONSTERS.forEach(mob => {
    const card = document.createElement("div");
    card.className = `stage-node ${mob.isBoss ? 'is-boss' : ''}`;
    card.innerHTML = `
      <div class="rune-icon" style="color: ${mob.color}; border-color: ${mob.color};">
        <i class="fa-solid ${mob.icon}"></i>
      </div>
      <h3>${mob.name}</h3>
      <div class="stats-preview">
        <span>HP: ${mob.hp}</span>
        <span>ATK: ${mob.atk}</span>
        <span>DEF: ${mob.def}</span>
      </div>
      <button class="btn-primary btn-sm" onclick="startCombat('${mob.id}')">Khiêu Chiến</button>
    `;
    grid.appendChild(card);
  });
}

// Quản lý Linh thú Pet
function renderPets() {
  const container = document.getElementById("pet-container");
  container.innerHTML = "";

  if (gameState.player.pets.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted);">Bạn chưa thu phục linh thú nào. Hãy đánh bại quái ở bản đồ để nhận!</p>`;
    return;
  }

  gameState.player.pets.forEach(pet => {
    const isEquipped = gameState.player.activePetId === pet.id;
    const card = document.createElement("div");
    card.className = `pet-card ${isEquipped ? 'selected' : ''}`;
    card.innerHTML = `
      <h3>${pet.name} (Lv. ${pet.level})</h3>
      <p>HP: +${pet.hp} | ATK: +${pet.atk} | DEF: +${pet.def}</p>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <button class="btn-primary btn-sm" onclick="toggleEquipPet('${pet.id}')">
          ${isEquipped ? 'Bỏ Ra Trận' : 'Xuất Chiến'}
        </button>
        <button class="btn-primary btn-sm" style="background: var(--accent-gold);" onclick="upgradePet('${pet.id}')">
          Nâng Cấp (50 Vàng, 10 Điểm)
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.toggleEquipPet = function(petId) {
  if (gameState.player.activePetId === petId) {
    gameState.player.activePetId = null;
  } else {
    gameState.player.activePetId = petId;
  }
  renderPets();
  renderTopStats();
};

window.upgradePet = function(petId) {
  const p = gameState.player;
  const pet = p.pets.find(i => i.id === petId);
  if (!pet) return;

  if (p.gold >= 50 && p.points >= 10) {
    p.gold -= 50;
    p.points -= 10;
    pet.level += 1;
    pet.hp += 20;
    pet.atk += 4;
    pet.def += 2;
    renderPets();
    renderTopStats();
  } else {
    alert("Không đủ 50 Vàng và 10 Điểm Tích Lũy để nâng cấp!");
  }
};

// Quản lý Bộ Thẻ Bài
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
    div.className = "badge-card";
    div.innerHTML = `
      <div class="card-emblem" style="color: ${card.color}; background: rgba(255,255,255,0.05);">
        <i class="fa-solid ${card.icon}"></i>
      </div>
      <h4>${card.name}</h4>
      <p>${card.desc}</p>
      <button class="btn-primary btn-sm" onclick="toggleCardEquip('${card.id}')">
        ${isEq ? 'Tháo Ra' : 'Trang Bị'}
      </button>
    `;

    if (isEq) {
      eqList.appendChild(div);
    } else {
      ownList.appendChild(div);
    }
  });
}

window.toggleCardEquip = function(cardId) {
  const p = gameState.player;
  if (p.equippedCards.includes(cardId)) {
    p.equippedCards = p.equippedCards.filter(id => id !== cardId);
  } else {
    if (p.equippedCards.length >= 5) {
      alert("Chỉ được trang bị tối đa 5 thẻ bài!");
      return;
    }
    p.equippedCards.push(cardId);
  }
  renderDeck();
  renderTopStats();
};

// Triệu hồi Convene & Mở quyền thẻ
function initConveneActions() {
  const btnTicket = document.getElementById("btn-roll-ticket");
  const btnPoint = document.getElementById("btn-roll-point");
  const log = document.getElementById("convene-log");

  btnTicket.addEventListener("click", () => {
    if (gameState.player.tickets <= 0) {
      alert("Bạn đã hết vé roll!");
      return;
    }
    gameState.player.tickets -= 1;
    rollCardLogic(log);
  });

  btnPoint.addEventListener("click", () => {
    if (gameState.player.points < 100) {
      alert("Cần tối thiểu 100 Điểm Tích Lũy!");
      return;
    }
    gameState.player.points -= 100;
    rollCardLogic(log);
  });
}

function rollCardLogic(logEl) {
  const unowned = CARDS_DATABASE.filter(c => !gameState.player.ownedCards.includes(c.id));
  if (unowned.length === 0) {
    logEl.innerHTML = `<p style="color: var(--accent-gold);">Bạn đã mở khóa toàn bộ thẻ bài hiện có!</p>`;
    renderTopStats();
    return;
  }
  const picked = unowned[Math.floor(Math.random() * unowned.length)];
  gameState.player.ownedCards.push(picked.id);
  logEl.innerHTML = `<p style="color: var(--accent-green);">Đã triệu hồi thành công thẻ mới: <b>${picked.name}</b>!</p>`;
  renderTopStats();
  renderDeck();
}

// Logic Trận Đấu
function initBattleModal() {
  document.getElementById("btn-flee").addEventListener("click", () => {
    clearInterval(gameState.combatInterval);
    document.getElementById("battle-modal").classList.add("hidden");
  });
}

window.startCombat = function(monsterId) {
  const mob = MAP1_MONSTERS.find(m => m.id === monsterId);
  if (!mob) return;

  const modal = document.getElementById("battle-modal");
  modal.classList.remove("hidden");

  // Tính stats người chơi
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

  // Trạng thái Quỹ Ngọn Cỏ của Boss Qing
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
  const avatar = document.getElementById("enemy-avatar");
  avatar.style.borderColor = mob.color;
  avatar.style.color = mob.color;
  avatar.innerHTML = `<i class="fa-solid ${mob.icon}"></i>`;

  const logBox = document.getElementById("combat-log");
  logBox.innerHTML = `<div>Trận đấu bắt đầu với <b>${mob.name}</b>!</div>`;

  clearInterval(gameState.combatInterval);

  // Vòng lặp trận đấu (tick 1s)
  gameState.combatInterval = setInterval(() => {
    // 1. Quản lý buff hồi máu Boss Qing nếu có
    if (mob.isBoss) {
      if (cooldownTimer > 0) cooldownTimer--;

      if (isRecovering) {
        recoveryTimer--;
        // Map 1 có hiệu ứng: hồi máu tăng 50% hiệu quả (5% * 1.5 = 7.5%)
        const healAmount = Math.floor(enemyMaxHp * 0.075);
        curEnemyHp = Math.min(enemyMaxHp, curEnemyHp + healAmount);
        logBox.innerHTML += `<div style="color: var(--accent-green);">Quỹ Ngọn Cỏ hồi phục cho Qing: +${healAmount} HP!</div>`;

        if (recoveryTimer <= 0) {
          isRecovering = false;
          enemyAtk = mob.atk;
          enemyDef = mob.def;
          document.getElementById("e-buff-tag").classList.add("hidden");
          logBox.innerHTML += `<div>Hiệu ứng khôi phục của Boss Qing đã kết thúc.</div>`;
        }
      }
    }

    // 2. Người chơi tấn công Quái
    const pDmg = Math.max(1, pAtk - Math.floor(enemyDef / 2));
    curEnemyHp -= pDmg;
    logBox.innerHTML += `<div>Bạn chém gây <b>${pDmg}</b> sát thương lên đối thủ.</div>`;

    // Khi Qing bị đánh -> tích 10-35% vào Quỹ
    if (mob.isBoss && !isRecovering && cooldownTimer <= 0) {
      const gain = Math.floor(Math.random() * 26) + 10;
      qingFund = Math.min(100, qingFund + gain);
      document.getElementById("qing-fund-bar").style.width = `${qingFund}%`;
      document.getElementById("qing-fund-text").innerText = `${qingFund}%`;

      if (qingFund >= 100) {
        qingFund = 0;
        isRecovering = true;
        recoveryTimer = 5;
        cooldownTimer = 20;
        enemyAtk = Math.floor(mob.atk * 1.2);
        enemyDef = Math.floor(mob.def * 1.4);
        document.getElementById("e-buff-tag").classList.remove("hidden");
        logBox.innerHTML += `<div style="color: var(--accent-gold); font-weight: bold;">Quỹ Ngọn Cỏ đạt 100%! Qing kích hoạt Khôi Phục (+20% ATK, +40% DEF)!</div>`;
      }
    }

    // Kiểm tra quái chết
    if (curEnemyHp <= 0) {
      curEnemyHp = 0;
      updateUI();
      clearInterval(gameState.combatInterval);
      handleVictory(mob);
      return;
    }

    // 3. Quái tấn công Người chơi
    const eDmg = Math.max(1, enemyAtk - Math.floor(pDef / 2));
    curPlayerHp -= eDmg;
    logBox.innerHTML += `<div style="color: #f87171;">Đối thủ phản đòn gây <b>${eDmg}</b> sát thương!</div>`;

    // Kiểm tra người chơi chết
    if (curPlayerHp <= 0) {
      curPlayerHp = 0;
      updateUI();
      clearInterval(gameState.combatInterval);
      logBox.innerHTML += `<div style="color: var(--accent-red); font-weight: bold;">Bạn đã bại trận! Hãy cường hóa thẻ và nâng cấp Pet trước khi thử lại.</div>`;
      return;
    }

    updateUI();
  }, 1000);

  function updateUI() {
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

  let msg = `Chiến thắng! Nhận được ${mob.rewardGold} Vàng. `;

  if (mob.isBoss) {
    p.tickets += mob.rewardTickets || 0;
    p.points += mob.rewardPoints || 0;
    msg += `Nhận thêm ${mob.rewardTickets} Vé Roll và ${mob.rewardPoints} Điểm Tích Lũy!`;
  }

  // Thu phục Pet (Stat cân bằng thấp hơn boss)
  if (mob.petDrop) {
    const existing = p.pets.find(pt => pt.name === mob.petDrop.name);
    if (!existing) {
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
