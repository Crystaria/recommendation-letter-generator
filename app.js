const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/xxx/yyy"; // REPLACE

const form = document.getElementById("letterForm");
const resultCard = document.getElementById("resultCard");
const letterOutput = document.getElementById("letterOutput");
const flagsText = document.getElementById("flagsText");
const submitBtn = document.getElementById("submitBtn");
const fillDemoBtn = document.getElementById("fillDemoBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

fillDemoBtn.addEventListener("click", () => {
  document.getElementById("student_name").value = "Alex Chen";
  document.getElementById("letter_type").value = "Counselor";
  document.getElementById("relationship_role").value = "Homeroom Teacher";
  document.getElementById("relationship_duration").value = "2 years";
  document.getElementById("deadline").valueAsDate = new Date(Date.now() + 1000*60*60*24*21);
  document.getElementById("strengths_tags").value = "diligent, collaborative, growth-minded";
  document.getElementById("anecdote_text").value = "He coordinated our class service project, kept peers on schedule, and summarized lessons with humility.";
  document.getElementById("intended_majors").value = "Computer Science; Data Science";
  document.getElementById("target_schools").value = "University of Michigan\nUC San Diego";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "生成中…";

  const payload = {
    student_name: document.getElementById("student_name").value.trim(),
    letter_type: document.getElementById("letter_type").value,
    relationship_role: document.getElementById("relationship_role").value,
    relationship_duration: document.getElementById("relationship_duration").value.trim() || "2 years",
    deadline: document.getElementById("deadline").value,
    strengths_tags: document.getElementById("strengths_tags").value.trim(),
    anecdote_text: document.getElementById("anecdote_text").value.trim(),
    intended_majors: document.getElementById("intended_majors").value.trim(),
    target_schools: document.getElementById("target_schools").value.trim(),
    salutation: document.getElementById("salutation")?.value?.trim() || "To Whom It May Concern,",
    us_style: true,
    letter_length: document.getElementById("letter_length")?.value || "~600",
    user_agent: navigator.userAgent
  };

  try {
    const res = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors"
    });

    if (!res.ok) throw new Error("网络错误，请稍后重试");

    const data = await res.json();

    letterOutput.textContent = data.letter_text || "No content returned.";
    flagsText.textContent = (data.risk_flags && data.risk_flags.length)
      ? `注意：${data.risk_flags.join(", ")}`
      : "";
    resultCard.classList.remove("hidden");

    const blob = new Blob([letterOutput.textContent], { type: "text/plain" });
    downloadBtn.href = URL.createObjectURL(blob);
  } catch (err) {
    letterOutput.textContent = `生成失败：${err.message}`;
    resultCard.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "生成推荐信";
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(letterOutput.textContent || "");
  copyBtn.textContent = "已复制";
  setTimeout(() => (copyBtn.textContent = "复制全文"), 1500);
});
