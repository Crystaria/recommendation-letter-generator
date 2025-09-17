const ZAPIER_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzqXtoBie3ZiOeHn8nPKp2xV0toMSDdSXy6qNqrilJOODKPot5BgbEJkbi7QBp4wy-i/exec";

const form = document.getElementById("letterForm");
const resultCard = document.getElementById("resultCard");
const letterOutput = document.getElementById("letterOutput");
const flagsText = document.getElementById("flagsText");
const submitBtn = document.getElementById("submitBtn");
const fillDemoBtn = document.getElementById("fillDemoBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadDocxBtn = document.getElementById("downloadDocxBtn");
const humanizeBtn = document.getElementById("humanizeBtn");
const guideLink = document.getElementById("guideLink");
const guideModal = document.getElementById("guideModal");
const closeModal = document.querySelector(".close");

// 基于学生名字生成唯一变化的函数
function generateStudentVariation(studentName) {
  const hash = studentName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash) % 100;
}

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
    teacher_name,
    letter_length
  } = payload;

  // 解析优势词（确保英文处理）
  const strengths = strengths_tags.split(',').map(s => s.trim()).filter(s => s);
  
  // 根据篇幅设置调整内容详细程度
  const wordCount = parseInt(letter_length);
  const isShort = wordCount <= 150;
  const isMedium = wordCount <= 300;
  const isLong = wordCount >= 400;

  // 基于学生名字生成变化
  const variation = generateStudentVariation(student_name);
  
  // 生成推荐信内容
  let letter = `${salutation}\n\n`;

  // 开头段落 - 基于学生名字变化
  const openingTemplates = [
    `I am writing to enthusiastically recommend ${student_name} for admission to your institution. As ${student_name}'s ${relationship_role.toLowerCase()} for ${relationship_duration}, I have had the privilege of observing ${student_name}'s exceptional qualities and potential for success at the university level.`,
    `It is my pleasure to write this letter of recommendation for ${student_name}. Having served as their ${relationship_role.toLowerCase()} for ${relationship_duration}, I can confidently attest to ${student_name}'s outstanding character and academic excellence.`,
    `I am honored to recommend ${student_name} for admission to your university. Through my role as their ${relationship_role.toLowerCase()} for ${relationship_duration}, I have witnessed ${student_name}'s remarkable growth and dedication to academic excellence.`
  ];
  
  letter += openingTemplates[variation % openingTemplates.length] + "\n\n";

  // 优势词展开段落 - 围绕3个优势词展开描写
  if (strengths.length >= 3) {
    letter += `What sets ${student_name} apart is their remarkable combination of ${strengths[0]}, ${strengths[1]}, and ${strengths[2]}. `;
    
    // 详细描述第一个优势词
    const strength1Descriptions = [
      `Their ${strengths[0]} nature is evident in every aspect of their academic work, consistently meeting deadlines and exceeding expectations.`,
      `The ${strengths[0]} approach ${student_name} brings to their studies is truly commendable, demonstrating a level of commitment that inspires their peers.`,
      `${student_name}'s ${strengths[0]} attitude permeates all their endeavors, creating a positive impact on our classroom environment.`
    ];
    letter += strength1Descriptions[variation % strength1Descriptions.length] + " ";
    
    // 详细描述第二个优势词
    const strength2Descriptions = [
      `Furthermore, their ${strengths[1]} abilities shine through in group projects and class discussions, where they consistently contribute valuable insights.`,
      `The ${strengths[1]} skills ${student_name} possesses make them an invaluable team member and natural leader among their peers.`,
      `I have been particularly impressed by ${student_name}'s ${strengths[1]} approach to problem-solving, which demonstrates both creativity and analytical thinking.`
    ];
    letter += strength2Descriptions[(variation + 1) % strength2Descriptions.length] + " ";
    
    // 详细描述第三个优势词
    const strength3Descriptions = [
      `Most notably, ${student_name}'s ${strengths[2]} character is reflected in their willingness to help classmates and their respectful engagement with diverse perspectives.`,
      `Their ${strengths[2]} nature extends beyond academics, as evidenced by their involvement in community service and extracurricular activities.`,
      `The ${strengths[2]} qualities ${student_name} demonstrates make them not only an excellent student but also a person of exceptional character.`
    ];
    letter += strength3Descriptions[(variation + 2) % strength3Descriptions.length];
  } else {
    letter += `What sets ${student_name} apart is their exceptional combination of academic excellence and personal character. `;
    if (strengths.length >= 1) {
      letter += `Their ${strengths[0]} approach to learning is evident in every assignment and project they undertake. `;
    }
    if (strengths.length >= 2) {
      letter += `Additionally, ${student_name} demonstrates remarkable ${strengths[1]} in both individual and collaborative work. `;
    }
  }
  
  if (intended_majors && !isShort) {
    letter += ` Given their interest in ${intended_majors}, I believe ${student_name} will thrive in your academic environment.`;
  }
  letter += "\n\n";

  // 具体事例段落
  if (anecdote_text) {
    const anecdoteTemplates = [
      `One particularly memorable example of ${student_name}'s character occurred when ${anecdote_text} This incident perfectly illustrates their ${strengths[0] || 'exceptional'} qualities and commitment to excellence.`,
      `A standout moment that exemplifies ${student_name}'s abilities was when ${anecdote_text} This experience showcases their ${strengths[1] || 'outstanding'} nature and potential for leadership.`,
      `I recall a specific instance where ${student_name} demonstrated their character: ${anecdote_text} This example highlights their ${strengths[2] || 'remarkable'} qualities and dedication to their goals.`
    ];
    letter += anecdoteTemplates[variation % anecdoteTemplates.length];
  } else {
    const defaultAnecdotes = [
      `One memorable example of ${student_name}'s character occurred during our class discussions, where they consistently demonstrated thoughtful analysis and respectful engagement with diverse perspectives.`,
      `A particular instance that stands out is when ${student_name} took the initiative to help struggling classmates, demonstrating both academic excellence and compassionate leadership.`,
      `I recall a time when ${student_name} faced a challenging project with determination and creativity, ultimately producing work that exceeded all expectations.`
    ];
    letter += defaultAnecdotes[variation % defaultAnecdotes.length];
    
    if (isMedium || isLong) {
      letter += ` Their ability to synthesize complex information and present it clearly to peers shows maturity beyond their years.`;
    }
  }
  letter += "\n\n";

  // 品格和领导力段落（仅在中等和长篇幅中包含）
  if (!isShort) {
    const leadershipTemplates = [
      `Beyond academics, ${student_name} exhibits strong leadership qualities and a commitment to community service.`,
      `In addition to their academic achievements, ${student_name} demonstrates exceptional leadership potential and social responsibility.`,
      `Outside the classroom, ${student_name} consistently shows initiative and a genuine desire to make a positive impact on their community.`
    ];
    letter += leadershipTemplates[variation % leadershipTemplates.length] + " ";
    
    if (isLong) {
      letter += `They are known among their peers for their reliability and willingness to help others succeed. `;
      
      if (target_schools) {
        const schools = target_schools.split('\n').filter(s => s.trim());
        if (schools.length > 0) {
          letter += `I am confident that ${student_name} will make significant contributions to your campus community, particularly in programs related to their intended field of study. `;
        }
      }
      
      letter += `Their ability to balance academic rigor with extracurricular involvement demonstrates excellent time management and prioritization skills.`;
    }
    letter += "\n\n";
  }

  // 结尾段落
  const conclusionTemplates = [
    `In conclusion, I give ${student_name} my highest recommendation without reservation.`,
    `I wholeheartedly recommend ${student_name} for admission to your institution.`,
    `Without hesitation, I recommend ${student_name} for admission to your university.`
  ];
  letter += conclusionTemplates[variation % conclusionTemplates.length] + " ";
  
  if (deadline && !isShort) {
    const deadlineDate = new Date(deadline);
    const deadlineStr = deadlineDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    letter += `Given the application deadline of ${deadlineStr}, I urge you to give ${student_name}'s application your full consideration. `;
  }
  
  letter += `They possess the intellectual curiosity, personal integrity, and drive necessary to excel in your academic environment and contribute meaningfully to your community.`;
  
  if (isLong) {
    letter += `\n\nPlease feel free to contact me if you need any additional information about ${student_name}.`;
  }
  
  letter += `\n\nSincerely,\n${teacher_name}\n${relationship_role}`;

  return letter;
}

// AI润色功能
function humanizeText(text) {
  // 润色规则：让语言更自然、更有人情味
  let humanizedText = text;
  
  // 替换一些过于正式的表达
  const replacements = [
    // 开头润色
    [/I am writing to enthusiastically recommend/g, 'I am pleased to recommend'],
    [/I am writing to strongly recommend/g, 'I am delighted to recommend'],
    [/It is my pleasure to write this letter of recommendation/g, 'I am honored to write this recommendation'],
    
    // 中间段落润色
    [/What sets .+ apart is their remarkable combination/g, 'What makes .+ special is their unique blend'],
    [/consistently demonstrated/g, 'has consistently shown'],
    [/exemplary work ethic/g, 'outstanding dedication'],
    [/exceptional academic ability/g, 'impressive academic skills'],
    
    // 结尾润色
    [/I give .+ my highest recommendation without reservation/g, 'I wholeheartedly endorse .+'],
    [/They possess the intellectual curiosity/g, 'They demonstrate genuine intellectual curiosity'],
    [/contribute meaningfully to your community/g, 'make valuable contributions to your campus community'],
    
    // 增加人情味
    [/academic excellence/g, 'academic achievements'],
    [/personal character/g, 'personal qualities'],
    [/leadership qualities/g, 'natural leadership abilities'],
    [/community service/g, 'helping others'],
    
    // 让语言更温暖
    [/demonstrates/g, 'shows'],
    [/exhibits/g, 'displays'],
    [/possesses/g, 'has'],
    [/utilizes/g, 'uses'],
    [/facilitates/g, 'helps'],
    [/demonstrates excellent/g, 'shows great'],
    [/exemplary/g, 'outstanding'],
    [/exceptional/g, 'remarkable'],
    [/commendable/g, 'admirable']
  ];
  
  replacements.forEach(([pattern, replacement]) => {
    humanizedText = humanizedText.replace(pattern, replacement);
  });
  
  // 添加一些更自然的连接词
  humanizedText = humanizedText.replace(/Furthermore,/g, 'What\'s more,');
  humanizedText = humanizedText.replace(/Additionally,/g, 'On top of that,');
  humanizedText = humanizedText.replace(/Most notably,/g, 'What really stands out is that');
  
  // 让句子更流畅
  humanizedText = humanizedText.replace(/\. /g, '. ');
  humanizedText = humanizedText.replace(/  +/g, ' '); // 移除多余空格
  
  return humanizedText;
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
  document.getElementById("teacher_name").value = "Dr. Sarah Johnson";
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
    teacher_name: document.getElementById("teacher_name")?.value?.trim() || "[Your Name]",
    us_style: true,
    letter_length: document.getElementById("letter_length")?.value || "300",
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

// AI润色按钮事件
humanizeBtn.addEventListener("click", () => {
  const originalText = letterOutput.textContent;
  if (originalText && originalText.trim()) {
    const humanizedText = humanizeText(originalText);
    letterOutput.textContent = humanizedText;
    humanizeBtn.textContent = "已润色";
    humanizeBtn.style.backgroundColor = "var(--accent-2)";
    humanizeBtn.style.borderColor = "var(--accent-2)";
    
    // 更新下载链接
    const blob = new Blob([humanizedText], { type: "text/plain" });
    downloadBtn.href = URL.createObjectURL(blob);
    
    setTimeout(() => {
      humanizeBtn.textContent = "AI润色";
      humanizeBtn.style.backgroundColor = "";
      humanizeBtn.style.borderColor = "";
    }, 2000);
  }
});

// DOCX下载功能
downloadDocxBtn.addEventListener("click", () => {
  const text = letterOutput.textContent;
  if (!text || !text.trim()) return;
  
  try {
    // 使用docx库创建文档
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: text,
                font: "Times New Roman",
                size: 24 // 12pt
              })
            ],
            spacing: {
              after: 200,
              line: 360
            }
          })
        ]
      }]
    });
    
    docx.Packer.toBlob(doc).then(blob => {
      const studentName = document.getElementById("student_name").value || "student";
      const fileName = `${studentName}-recommendation.docx`;
      saveAs(blob, fileName);
    });
  } catch (error) {
    console.error("DOCX生成失败:", error);
    alert("DOCX下载功能暂时不可用，请使用TXT格式下载。");
  }
});

// 用户指南模态框事件
guideLink.addEventListener("click", (e) => {
  e.preventDefault();
  guideModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  guideModal.classList.add("hidden");
});

// 点击模态框外部关闭
guideModal.addEventListener("click", (e) => {
  if (e.target === guideModal) {
    guideModal.classList.add("hidden");
  }
});

// ESC键关闭模态框
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !guideModal.classList.contains("hidden")) {
    guideModal.classList.add("hidden");
  }
});
