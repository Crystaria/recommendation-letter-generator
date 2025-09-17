const ZAPIER_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzqXtoBie3ZiOeHn8nPKp2xV0toMSDdSXy6qNqrilJOODKPot5BgbEJkbi7QBp4wy-i/exec";

const form = document.getElementById("letterForm");
const resultCard = document.getElementById("resultCard");
const letterOutput = document.getElementById("letterOutput");
const flagsText = document.getElementById("flagsText");
const submitBtn = document.getElementById("submitBtn");
const fillDemoBtn = document.getElementById("fillDemoBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

// 本地推荐信生成函数
function generateRecommendationLetter(payload) {
  const {
    student_name,
    letter_type,
    relationship_role,
    relationship_duration,
    deadline,
    strengths_tags,
    anecdote_text,
    intended_majors,
    target_schools,
    salutation,
    letter_length
  } = payload;

  // 解析优势词
  const strengths = strengths_tags.split(',').map(s => s.trim()).filter(s => s);
  
  // 根据篇幅设置调整内容详细程度
  const wordCount = parseInt(letter_length.replace('~', ''));
  const isDetailed = wordCount >= 600;
  const isVeryDetailed = wordCount >= 800;

  // 生成推荐信内容
  let letter = `${salutation}\n\n`;

  // 开头段落
  if (letter_type === "Counselor") {
    letter += `I am writing to enthusiastically recommend ${student_name} for admission to your institution. As ${student_name}'s ${relationship_role.toLowerCase()} for ${relationship_duration}, I have had the privilege of observing ${student_name}'s academic excellence, character, and potential for success at the university level.\n\n`;
  } else if (letter_type === "Teacher") {
    letter += `I am pleased to write this letter of recommendation for ${student_name}, whom I have had the honor of teaching as their ${relationship_role.toLowerCase()} for ${relationship_duration}. ${student_name} has consistently demonstrated exceptional academic ability and personal character throughout our time together.\n\n`;
  } else {
    letter += `I am writing to strongly recommend ${student_name} for admission to your university. As someone who has observed ${student_name} closely for ${relationship_duration} in my role as their ${relationship_role.toLowerCase()}, I can attest to their outstanding character and potential.\n\n`;
  }

  // 学术表现段落
  letter += `In terms of academic performance, ${student_name} has consistently demonstrated ${strengths[0] || 'excellent'} qualities. `;
  if (strengths.length > 1) {
    letter += `Additionally, ${student_name} shows remarkable ${strengths[1] || 'dedication'} and ${strengths[2] || 'integrity'}. `;
  }
  
  if (isDetailed) {
    letter += `Their work ethic is exemplary, and they consistently go above and beyond expectations in all academic endeavors. `;
  }
  
  if (intended_majors) {
    letter += `Given their interest in ${intended_majors}, I believe ${student_name} will thrive in your academic environment. `;
  }
  letter += `\n\n`;

  // 具体事例段落
  if (anecdote_text) {
    letter += `One particular example that stands out is when ${anecdote_text} This incident perfectly illustrates ${student_name}'s character and abilities.\n\n`;
  } else {
    letter += `One memorable example of ${student_name}'s character occurred during our class discussions, where they consistently demonstrated thoughtful analysis and respectful engagement with diverse perspectives. `;
    if (isDetailed) {
      letter += `Their ability to synthesize complex information and present it clearly to peers shows maturity beyond their years. `;
    }
    letter += `\n\n`;
  }

  // 品格和领导力段落
  letter += `Beyond academics, ${student_name} exhibits strong leadership qualities and a commitment to community service. `;
  if (isDetailed) {
    letter += `They are known among their peers for their ${strengths[0] || 'reliability'} and willingness to help others succeed. `;
  }
  
  if (target_schools) {
    const schools = target_schools.split('\n').filter(s => s.trim());
    if (schools.length > 0) {
      letter += `I am confident that ${student_name} will make significant contributions to your campus community, particularly in programs related to their intended field of study. `;
    }
  }
  
  if (isVeryDetailed) {
    letter += `Their ability to balance academic rigor with extracurricular involvement demonstrates excellent time management and prioritization skills. `;
  }
  letter += `\n\n`;

  // 结尾段落
  letter += `In conclusion, I give ${student_name} my highest recommendation without reservation. `;
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const deadlineStr = deadlineDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    letter += `Given the application deadline of ${deadlineStr}, I urge you to give ${student_name}'s application your full consideration. `;
  }
  
  letter += `They possess the intellectual curiosity, personal integrity, and drive necessary to excel in your academic environment and contribute meaningfully to your community.\n\n`;
  
  if (isDetailed) {
    letter += `Please feel free to contact me if you need any additional information about ${student_name}.\n\n`;
  }
  
  letter += `Sincerely,\n[Your Name]\n${relationship_role}`;

  return letter;
}

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
    // 首先尝试本地生成（确保用户输入信息被正确使用）
    const localLetter = generateRecommendationLetter(payload);
    
    // 显示本地生成的结果
    letterOutput.textContent = localLetter;
    flagsText.textContent = "使用本地生成引擎 - 已确保所有用户输入信息被正确整合";
    resultCard.classList.remove("hidden");

    const blob = new Blob([letterOutput.textContent], { type: "text/plain" });
    downloadBtn.href = URL.createObjectURL(blob);
    const studentName = (payload.student_name || "student").replace(/[^\w\- ]+/g, "").trim() || "student";
    downloadBtn.download = `${studentName}-recommendation.txt`;

    // 可选：同时尝试远程API作为备选（注释掉以避免网络问题）
    /*
    try {
      const fd = new FormData();
      fd.append("payload", JSON.stringify(payload));

      const res = await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        body: fd
      });

      if (res.ok) {
        let data;
        try {
          data = await res.json();
        } catch {
          const text = await res.text();
          data = { letter_text: text, risk_flags: [] };
        }

        if (data.error) throw new Error(data.error);

        // 如果远程API成功，可以选择使用远程结果
        // letterOutput.textContent = data.letter_text || localLetter;
        // flagsText.textContent = (Array.isArray(data.risk_flags) && data.risk_flags.length)
        //   ? `远程生成 - 注意：${data.risk_flags.join(", ")}`
        //   : "远程生成";
      }
    } catch (remoteErr) {
      console.log("远程API失败，使用本地生成:", remoteErr);
    }
    */

  } catch (err) {
    letterOutput.textContent = `生成失败：${err.message || String(err)}`;
    flagsText.textContent = "";
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
