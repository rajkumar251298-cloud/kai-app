export type LogicRound = {
  sequence: string[];
  options: string[];
  answer: string;
};

/** 30 sets × 5 rounds; index = dayOfYear % 30 */
export const LOGIC_PATTERN_SETS: LogicRound[][] = [
  // 0 — Growth
  [
    { sequence: ["🌱", "🌿", "🌳", "❓"], options: ["🌲", "🍂", "🪨", "💧"], answer: "🌲" },
    { sequence: ["1️⃣", "2️⃣", "3️⃣", "❓"], options: ["4️⃣", "5️⃣", "6️⃣", "0️⃣"], answer: "4️⃣" },
    { sequence: ["🐣", "🐥", "🐔", "❓"], options: ["🦃", "🦆", "🐧", "🦢"], answer: "🦃" },
    { sequence: ["☀️", "🌤️", "⛅", "❓"], options: ["🌧️", "🌙", "🌈", "❄️"], answer: "🌧️" },
    { sequence: ["🥉", "🥈", "🥇", "❓"], options: ["🏆", "🎖️", "⭐", "🎯"], answer: "🏆" },
  ],
  // 1 — Colour / time
  [
    { sequence: ["🌅", "☀️", "🌇", "❓"], options: ["🌙", "🌈", "⛅", "🌧️"], answer: "🌙" },
    { sequence: ["🍼", "👦", "👨", "❓"], options: ["👴", "👶", "🧓", "👵"], answer: "👴" },
    { sequence: ["💧", "🌊", "🌧️", "❓"], options: ["⛈️", "☀️", "❄️", "🌈"], answer: "⛈️" },
    { sequence: ["🌑", "🌒", "🌓", "❓"], options: ["🌔", "🌕", "🌖", "🌗"], answer: "🌔" },
    { sequence: ["🔴", "🟡", "🟢", "❓"], options: ["🔵", "🟣", "⚫", "⚪"], answer: "🔵" },
  ],
  // 2 — Action
  [
    { sequence: ["🚶", "🏃", "🚴", "❓"], options: ["✈️", "🚗", "🚌", "🛴"], answer: "✈️" },
    { sequence: ["📖", "📚", "🎓", "❓"], options: ["👨‍🏫", "✏️", "📝", "📐"], answer: "👨‍🏫" },
    { sequence: ["💭", "💬", "📢", "❓"], options: ["📣", "🔇", "📱", "☎️"], answer: "📣" },
    { sequence: ["🌱", "🌻", "🍎", "❓"], options: ["🌰", "🥕", "🥔", "🌽"], answer: "🌰" },
    { sequence: ["😴", "🥱", "😐", "❓"], options: ["😄", "😊", "☕", "🎉"], answer: "😄" },
  ],
  // 3 — Number patterns
  [
    { sequence: ["2️⃣", "4️⃣", "8️⃣", "❓"], options: ["1️⃣6️⃣", "🔟", "6️⃣", "9️⃣"], answer: "1️⃣6️⃣" },
    { sequence: ["🔟", "8️⃣", "6️⃣", "❓"], options: ["4️⃣", "2️⃣", "5️⃣", "3️⃣"], answer: "4️⃣" },
    { sequence: ["1️⃣", "1️⃣", "2️⃣", "❓"], options: ["3️⃣", "4️⃣", "5️⃣", "8️⃣"], answer: "3️⃣" },
    { sequence: ["5️⃣", "🔟", "🔟", "❓"], options: ["5️⃣", "1️⃣5️⃣", "2️⃣0️⃣", "0️⃣"], answer: "5️⃣" },
    { sequence: ["3️⃣", "6️⃣", "9️⃣", "❓"], options: ["1️⃣2️⃣", "🔟", "1️⃣1️⃣", "1️⃣5️⃣"], answer: "1️⃣2️⃣" },
  ],
  // 4 — Emotion journey
  [
    { sequence: ["😤", "😐", "🙂", "❓"], options: ["😊", "😡", "😭", "🤯"], answer: "😊" },
    { sequence: ["😊", "😄", "😂", "❓"], options: ["🤣", "🙂", "😅", "🥲"], answer: "🤣" },
    { sequence: ["😴", "🥱", "😐", "❓"], options: ["☕", "😊", "🎉", "💤"], answer: "☕" },
    { sequence: ["😰", "😟", "😐", "❓"], options: ["😌", "😱", "🤬", "😵"], answer: "😌" },
    { sequence: ["🤔", "💡", "😮", "❓"], options: ["🎉", "😴", "😐", "😤"], answer: "🎉" },
  ],
  // 5 — Sizes
  [
    { sequence: ["🟢", "🟡", "🟠", "❓"], options: ["🔴", "⚪", "⚫", "🟣"], answer: "🔴" },
    { sequence: ["🐜", "🐭", "🐕", "❓"], options: ["🐘", "🐱", "🐰", "🦊"], answer: "🐘" },
    { sequence: ["📄", "📃", "📜", "❓"], options: ["📚", "📕", "📗", "📘"], answer: "📚" },
    { sequence: ["💧", "🥤", "🪣", "❓"], options: ["🏊", "🌊", "☔", "🚿"], answer: "🏊" },
    { sequence: ["🌱", "🪴", "🌳", "❓"], options: ["🌲", "🏔️", "🗻", "⛰️"], answer: "🌲" },
  ],
  // 6 — Heat
  [
    { sequence: ["❄️", "🧊", "💧", "❓"], options: ["☀️", "🔥", "🌡️", "🥶"], answer: "☀️" },
    { sequence: ["🕯️", "🔥", "🌋", "❓"], options: ["☀️", "💥", "⚡", "🎆"], answer: "☀️" },
    { sequence: ["🥶", "🧣", "🔥", "❓"], options: ["🌡️", "❄️", "☃️", "⛷️"], answer: "🌡️" },
    { sequence: ["🌙", "🌅", "☀️", "❓"], options: ["🌇", "🌃", "🌆", "🌄"], answer: "🌇" },
    { sequence: ["1️⃣", "3️⃣", "6️⃣", "❓"], options: ["🔟", "9️⃣", "7️⃣", "5️⃣"], answer: "🔟" },
  ],
  // 7 — Food chain
  [
    { sequence: ["🌾", "🍞", "🥪", "❓"], options: ["😋", "🍽️", "🧑", "🚮"], answer: "😋" },
    { sequence: ["🥚", "🍳", "🥓", "❓"], options: ["🍽️", "🥞", "🧇", "🥐"], answer: "🍽️" },
    { sequence: ["🍇", "🍷", "🍾", "❓"], options: ["🥂", "🧃", "☕", "🍵"], answer: "🥂" },
    { sequence: ["🌽", "🍿", "🎬", "❓"], options: ["😄", "🎥", "🥤", "🍫"], answer: "😄" },
    { sequence: ["🍎", "🍏", "🍐", "❓"], options: ["🍊", "🍋", "🍌", "🍉"], answer: "🍊" },
  ],
  // 8 — Tools → outcome
  [
    { sequence: ["🔨", "🪚", "🪛", "❓"], options: ["🏠", "🪵", "📦", "🧱"], answer: "🏠" },
    { sequence: ["✏️", "📝", "📄", "❓"], options: ["📚", "📧", "✉️", "📮"], answer: "📚" },
    { sequence: ["🧪", "🔬", "📊", "❓"], options: ["💡", "⚗️", "🧬", "🔭"], answer: "💡" },
    { sequence: ["🎨", "🖌️", "🖼️", "❓"], options: ["🏛️", "🎭", "📷", "🎬"], answer: "🏛️" },
    { sequence: ["⌨️", "💻", "🖥️", "❓"], options: ["🚀", "📱", "🌐", "💾"], answer: "🚀" },
  ],
  // 9 — Sports progression
  [
    { sequence: ["⚽", "🥅", "🎉", "❓"], options: ["🏆", "😅", "🧤", "👟"], answer: "🏆" },
    { sequence: ["🏃", "🏃‍♂️", "🏅", "❓"], options: ["🥇", "🥤", "🛋️", "😴"], answer: "🥇" },
    { sequence: ["🎾", "🔄", "🏓", "❓"], options: ["🏸", "⛳", "🥊", "🎳"], answer: "🏸" },
    { sequence: ["🧘", "🏋️", "🚴", "❓"], options: ["🏆", "🍕", "📺", "🛏️"], answer: "🏆" },
    { sequence: ["🎯", "🎯", "🎯", "❓"], options: ["💯", "🏹", "🎲", "🎰"], answer: "💯" },
  ],
  // 10 — Music
  [
    { sequence: ["🎼", "🎵", "🎶", "❓"], options: ["🎤", "🎧", "🔇", "📻"], answer: "🎤" },
    { sequence: ["🎹", "🎸", "🥁", "❓"], options: ["🎺", "🎻", "🪕", "🪘"], answer: "🎺" },
    { sequence: ["🔈", "🔉", "🔊", "❓"], options: ["📢", "🔇", "🎧", "📣"], answer: "📢" },
    { sequence: ["📻", "💿", "📱", "❓"], options: ["☁️", "🎧", "📺", "⌚"], answer: "☁️" },
    { sequence: ["🎤", "🎙️", "🎚️", "❓"], options: ["🎛️", "📼", "💽", "🎞️"], answer: "🎛️" },
  ],
  // 11 — Space
  [
    { sequence: ["🌍", "🌎", "🌏", "❓"], options: ["🌕", "🪐", "☄️", "🌠"], answer: "🌕" },
    { sequence: ["🚀", "🛰️", "🌌", "❓"], options: ["👽", "🌠", "☄️", "🪐"], answer: "👽" },
    { sequence: ["☀️", "🌞", "⭐", "❓"], options: ["🌟", "✨", "💫", "🌙"], answer: "🌟" },
    { sequence: ["🌑", "🌘", "🌗", "❓"], options: ["🌖", "🌕", "🌓", "🌒"], answer: "🌖" },
    { sequence: ["🔭", "📡", "🛸", "❓"], options: ["👾", "🤖", "🧑‍🚀", "☄️"], answer: "👾" },
  ],
  // 12 — Office
  [
    { sequence: ["📧", "📨", "📩", "❓"], options: ["📬", "📭", "📮", "🗳️"], answer: "📬" },
    { sequence: ["9️⃣", "5️⃣", "1️⃣", "❓"], options: ["🔟", "0️⃣", "2️⃣", "4️⃣"], answer: "🔟" },
    { sequence: ["📅", "📆", "🗓️", "❓"], options: ["⏰", "⌛", "⏳", "🕐"], answer: "⏰" },
    { sequence: ["💼", "📎", "🖇️", "❓"], options: ["📁", "🗂️", "🗃️", "📇"], answer: "📁" },
    { sequence: ["☕", "📝", "💻", "❓"], options: ["✅", "😫", "🏠", "🛏️"], answer: "✅" },
  ],
  // 13 — Nature weather
  [
    { sequence: ["🌤️", "⛅", "🌥️", "❓"], options: ["☁️", "🌧️", "🌈", "⛈️"], answer: "☁️" },
    { sequence: ["🍃", "🍂", "❄️", "❓"], options: ["🌸", "☀️", "🌻", "🌷"], answer: "🌸" },
    { sequence: ["🌊", "🏄", "🏖️", "❓"], options: ["🐚", "⛱️", "🧴", "🕶️"], answer: "🐚" },
    { sequence: ["🌵", "🏜️", "🐪", "❓"], options: ["🕌", "🧭", "💧", "🌴"], answer: "🕌" },
    { sequence: ["🐝", "🌻", "🍯", "❓"], options: ["😋", "🐻", "🥄", "🍞"], answer: "😋" },
  ],
  // 14 — Tech evolution
  [
    { sequence: ["📟", "📱", "⌚", "❓"], options: ["🥽", "💻", "🖨️", "☎️"], answer: "🥽" },
    { sequence: ["💾", "💿", "📀", "❓"], options: ["☁️", "📼", "🎞️", "📷"], answer: "☁️" },
    { sequence: ["🖱️", "⌨️", "🖥️", "❓"], options: ["🖨️", "📠", "📺", "🎮"], answer: "🖨️" },
    { sequence: ["📶", "4️⃣G", "5️⃣G", "❓"], options: ["6️⃣G", "📡", "📵", "📴"], answer: "6️⃣G" },
    { sequence: ["🔋", "🔌", "⚡", "❓"], options: ["💡", "🔦", "🕯️", "☀️"], answer: "💡" },
  ],
  // 15 — Money
  [
    { sequence: ["💵", "💴", "💶", "❓"], options: ["💷", "💰", "🪙", "💳"], answer: "💷" },
    { sequence: ["🪙", "💰", "🏦", "❓"], options: ["📈", "📉", "🏧", "💸"], answer: "📈" },
    { sequence: ["📉", "📊", "📈", "❓"], options: ["🚀", "💥", "🏠", "🎯"], answer: "🚀" },
    { sequence: ["🧾", "✍️", "📬", "❓"], options: ["💸", "✅", "❌", "📭"], answer: "💸" },
    { sequence: ["1️⃣", "💯", "1️⃣K", "❓"], options: ["1️⃣M", "🔟K", "5️⃣0️⃣", "9️⃣9️⃣"], answer: "1️⃣M" },
  ],
  // 16 — Transport
  [
    { sequence: ["🚲", "🛵", "🚗", "❓"], options: ["🚕", "🚌", "🚎", "🚐"], answer: "🚌" },
    { sequence: ["🚶", "🚴", "🛴", "❓"], options: ["🛹", "🛼", "🚁", "🛶"], answer: "🚁" },
    { sequence: ["⛵", "🛥️", "🚢", "❓"], options: ["🛳️", "⚓", "🏝️", "🌊"], answer: "🛳️" },
    { sequence: ["🛤️", "🚆", "🚄", "❓"], options: ["🚅", "🚇", "🚝", "🚈"], answer: "🚅" },
    { sequence: ["🧳", "🎫", "✈️", "❓"], options: ["🛫", "🛬", "🌍", "🏨"], answer: "🛫" },
  ],
  // 17 — Home
  [
    { sequence: ["🛏️", "🛋️", "📺", "❓"], options: ["😴", "🍿", "🧹", "🚪"], answer: "😴" },
    { sequence: ["🧹", "🧽", "🪣", "❓"], options: ["✨", "🧴", "🪥", "🧼"], answer: "✨" },
    { sequence: ["🍳", "🥘", "🍽️", "❓"], options: ["😋", "🧹", "📺", "🛋️"], answer: "😋" },
    { sequence: ["🌱", "💧", "☀️", "❓"], options: ["🌿", "🥀", "🍂", "🪴"], answer: "🌿" },
    { sequence: ["🔑", "🚪", "🏠", "❓"], options: ["🛋️", "😌", "📦", "🧳"], answer: "😌" },
  ],
  // 18 — Communication
  [
    { sequence: ["🤐", "😐", "🗣️", "❓"], options: ["📣", "🤫", "😶", "🙊"], answer: "📣" },
    { sequence: ["✉️", "📧", "📨", "❓"], options: ["📬", "📱", "📞", "💬"], answer: "📬" },
    { sequence: ["👂", "🤔", "💬", "❓"], options: ["🤝", "👋", "🙌", "✍️"], answer: "🤝" },
    { sequence: ["📵", "📴", "🔕", "❓"], options: ["📳", "🔔", "📶", "☎️"], answer: "📳" },
    { sequence: ["🐦", "📸", "📱", "❓"], options: ["🌐", "📰", "📻", "📺"], answer: "🌐" },
  ],
  // 19 — Logic grid
  [
    { sequence: ["⬜", "⬛", "⬜", "❓"], options: ["⬛", "⬜", "🟨", "🟥"], answer: "⬛" },
    { sequence: ["🔺", "🔻", "🔺", "❓"], options: ["🔻", "⭕", "⬜", "⭐"], answer: "🔻" },
    { sequence: ["1️⃣", "4️⃣", "9️⃣", "❓"], options: ["1️⃣6️⃣", "2️⃣5️⃣", "3️⃣6️⃣", "4️⃣9️⃣"], answer: "1️⃣6️⃣" },
    { sequence: ["🅰️", "🅱️", "🅰️", "❓"], options: ["🅱️", "🆎", "🅾️", "🆑"], answer: "🅱️" },
    { sequence: ["◀️", "⏸️", "▶️", "❓"], options: ["⏭️", "⏯️", "⏹️", "🔁"], answer: "⏭️" },
  ],
  // 20 — Time units
  [
    { sequence: ["⏱️", "⏲️", "🕐", "❓"], options: ["📅", "🗓️", "⌛", "⏰"], answer: "📅" },
    { sequence: ["🌙", "🌅", "☀️", "❓"], options: ["🌆", "🌃", "🌇", "🌄"], answer: "🌆" },
    { sequence: ["Mon", "Tue", "Wed", "❓"], options: ["Thu", "Fri", "Sat", "Sun"], answer: "Thu" },
    { sequence: ["Jan", "Feb", "Mar", "❓"], options: ["Apr", "May", "Jun", "Jul"], answer: "Apr" },
    { sequence: ["🕛", "🕒", "🕕", "❓"], options: ["🕘", "🕙", "🕚", "🕧"], answer: "🕘" },
  ],
  // 21 — Materials
  [
    { sequence: ["🪨", "🧱", "🏠", "❓"], options: ["🏙️", "🌉", "⛩️", "🛖"], answer: "🏙️" },
    { sequence: ["🧵", "🪡", "👕", "❓"], options: ["👔", "🧥", "👗", "🧦"], answer: "👔" },
    { sequence: ["🌲", "🪵", "🔥", "❓"], options: ["🪨", "💨", "♨️", "🌫️"], answer: "🪨" },
    { sequence: ["🥇", "🥈", "🥉", "❓"], options: ["🏅", "🎖️", "⭐", "💎"], answer: "🏅" },
    { sequence: ["🧊", "💧", "☁️", "❓"], options: ["🌧️", "❄️", "🌨️", "🌈"], answer: "🌧️" },
  ],
  // 22 — Faces intensity
  [
    { sequence: ["🙂", "😊", "😁", "❓"], options: ["🤩", "😐", "😢", "😴"], answer: "🤩" },
    { sequence: ["😶", "😮", "😲", "❓"], options: ["🤯", "😴", "🥱", "😌"], answer: "🤯" },
    { sequence: ["🥺", "😢", "😭", "❓"], options: ["🤗", "😤", "🤬", "😵"], answer: "🤗" },
    { sequence: ["😇", "🤓", "🧐", "❓"], options: ["🤠", "😎", "🥸", "🤡"], answer: "🤠" },
    { sequence: ["🤝", "🙌", "👏", "❓"], options: ["🎉", "👍", "💪", "❤️"], answer: "🎉" },
  ],
  // 23 — Shapes math
  [
    { sequence: ["△", "□", "⬠", "❓"], options: ["⬡", "○", "◇", "⬢"], answer: "⬡" },
    { sequence: ["1️⃣", "3️⃣", "6️⃣", "🔟", "❓"], options: ["1️⃣5️⃣", "2️⃣0️⃣", "1️⃣2️⃣", "8️⃣"], answer: "1️⃣5️⃣" },
    { sequence: ["🔵", "🔵🔵", "🔵🔵🔵", "❓"], options: ["4️⃣", "5️⃣", "🔢", "➕"], answer: "4️⃣" },
    { sequence: ["½", "¼", "⅛", "❓"], options: ["1/16", "1️⃣", "0️⃣", "⅓"], answer: "1/16" },
    { sequence: ["➕", "➖", "✖️", "❓"], options: ["➗", "🟰", "♾️", "📐"], answer: "➗" },
  ],
  // 24 — Work flow
  [
    { sequence: ["💡", "📋", "✍️", "❓"], options: ["✅", "❌", "🔄", "⏸️"], answer: "✅" },
    { sequence: ["📥", "🔍", "🛠️", "❓"], options: ["📤", "📧", "🗑️", "📎"], answer: "📤" },
    { sequence: ["🐛", "🔧", "🧪", "❓"], options: ["🚀", "☕", "😴", "📺"], answer: "🚀" },
    { sequence: ["📝", "👀", "💬", "❓"], options: ["🔄", "🗑️", "📌", "⏰"], answer: "🔄" },
    { sequence: ["🎯", "📊", "📈", "❓"], options: ["🏆", "📉", "😴", "🍕"], answer: "🏆" },
  ],
  // 25 — Opposites
  [
    { sequence: ["⬆️", "➡️", "⬇️", "❓"], options: ["⬅️", "↩️", "🔃", "🔄"], answer: "⬅️" },
    { sequence: ["🔒", "🔓", "🔐", "❓"], options: ["🔑", "🗝️", "🚪", "🛡️"], answer: "🔑" },
    { sequence: ["☀️", "🌤️", "☁️", "❓"], options: ["🌧️", "🌈", "⛈️", "🌙"], answer: "🌧️" },
    { sequence: ["✅", "⚠️", "❌", "❓"], options: ["🔄", "⏭️", "🆘", "💯"], answer: "🔄" },
    { sequence: ["🥶", "😐", "🥵", "❓"], options: ["🌡️", "😎", "🧊", "🔥"], answer: "🌡️" },
  ],
  // 26 — Cycles
  [
    { sequence: ["♻️", "🔄", "🔁", "❓"], options: ["🔂", "⏭️", "⏮️", "🔃"], answer: "🔂" },
    { sequence: ["🌱", "🌸", "🍎", "❓"], options: ["🍂", "❄️", "🌿", "🥀"], answer: "🍂" },
    { sequence: ["💤", "☕", "💻", "❓"], options: ["😴", "🏃", "🎉", "📺"], answer: "😴" },
    { sequence: ["📅", "📆", "🗓️", "❓"], options: ["🎊", "🎆", "🎇", "✨"], answer: "🎊" },
    { sequence: ["0️⃣", "1️⃣", "1️⃣", "❓"], options: ["2️⃣", "3️⃣", "4️⃣", "5️⃣"], answer: "2️⃣" },
  ],
  // 27 — Social
  [
    { sequence: ["👤", "👥", "👨‍👩‍👧", "❓"], options: ["👨‍👩‍👧‍👦", "🏘️", "🌍", "🧑‍🤝‍🧑"], answer: "👨‍👩‍👧‍👦" },
    { sequence: ["🤝", "🫱", "🫲", "❓"], options: ["🙏", "👏", "✊", "🤲"], answer: "🙏" },
    { sequence: ["💬", "📢", "🗣️", "❓"], options: ["📣", "🔇", "📵", "☎️"], answer: "📣" },
    { sequence: ["🧍", "🧎", "🧑‍🦽", "❓"], options: ["🏃", "🚶", "🧘", "🛌"], answer: "🏃" },
    { sequence: ["❤️", "💛", "💚", "❓"], options: ["💙", "💜", "🖤", "🤍"], answer: "💙" },
  ],
  // 28 — Games
  [
    { sequence: ["🎲", "🎯", "🎰", "❓"], options: ["🏆", "🃏", "🎮", "🕹️"], answer: "🏆" },
    { sequence: ["🃏", "🃏", "🎴", "❓"], options: ["🀄", "🎭", "🎪", "🎨"], answer: "🀄" },
    { sequence: ["⬜", "⬜⬜", "⬜⬜⬜", "❓"], options: ["4️⃣", "5️⃣", "6️⃣", "🔢"], answer: "4️⃣" },
    { sequence: ["🕹️", "🎮", "🖥️", "❓"], options: ["☁️", "📱", "⌨️", "🖱️"], answer: "☁️" },
    { sequence: ["🥅", "⚽", "🎉", "❓"], options: ["🏆", "😭", "🥤", "🛋️"], answer: "🏆" },
  ],
  // 29 — Meta KAI
  [
    { sequence: ["💭", "📝", "✅", "❓"], options: ["🔥", "😴", "📺", "🍕"], answer: "🔥" },
    { sequence: ["😴", "⏰", "☕", "❓"], options: ["💪", "🛏️", "📱", "🎮"], answer: "💪" },
    { sequence: ["🎯", "📌", "🔔", "❓"], options: ["✅", "❌", "🔄", "⏸️"], answer: "✅" },
    { sequence: ["📉", "🤔", "📈", "❓"], options: ["🚀", "😤", "🛌", "🍿"], answer: "🚀" },
    { sequence: ["1️⃣", "2️⃣", "3️⃣", "❓"], options: ["4️⃣", "🎯", "✅", "🏁"], answer: "4️⃣" },
  ],
];
