import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Youtube, 
  Linkedin, 
  Mail, 
  BookOpen, 
  Users, 
  Star, 
  TrendingUp,
  Award,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-800">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-amber-500">课代表立正</span>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400">Yuzheng Sun</span>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <button onClick={() => scrollToSection('about')} className="text-zinc-400 hover:text-amber-500 transition-colors">About</button>
              <button onClick={() => scrollToSection('course')} className="text-zinc-400 hover:text-amber-500 transition-colors">AI Builders</button>
              <button onClick={() => scrollToSection('background')} className="text-zinc-400 hover:text-amber-500 transition-colors">Background</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-zinc-400 hover:text-amber-500 transition-colors">Testimonials</button>
              <Button variant="default" className="bg-amber-600 hover:bg-amber-700" asChild>
                <a href="https://www.superlinear.academy/feed" target="_blank" rel="noopener noreferrer">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </a>
              </Button>
            </div>
            <button 
              className="lg:hidden text-zinc-400 hover:text-amber-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-3">
              <button onClick={() => scrollToSection('about')} className="block text-zinc-400 hover:text-amber-500 transition-colors">About</button>
              <button onClick={() => scrollToSection('course')} className="block text-zinc-400 hover:text-amber-500 transition-colors">AI Builders</button>
              <button onClick={() => scrollToSection('background')} className="block text-zinc-400 hover:text-amber-500 transition-colors">Background</button>
              <button onClick={() => scrollToSection('testimonials')} className="block text-zinc-400 hover:text-amber-500 transition-colors">Testimonials</button>
              <a href="mailto:yz@superlinear.academy" className="block text-zinc-400 hover:text-amber-500 transition-colors">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                用AI创造价值，积累
                <span className="text-amber-500">超线性增长</span>
              </h1>
              <p className="text-xl text-zinc-400">Stay foolish</p>
            </div>
            
            <p className="text-lg text-zinc-300 leading-relaxed">
              Superlinear Academy创始人。前Statsig布道师（OpenAI收购），腾讯数据科学副总监，Meta数据科学家，亚马逊经济学家；康奈尔经济学博士。
            </p>

            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                30万+ 全网订阅
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Maven Top AI Instructor
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                2000+ 学员
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto" onClick={() => scrollToSection('course')}>
                <BookOpen className="w-5 h-5 mr-2" />
                查看课程
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800 w-full sm:w-auto" onClick={() => scrollToSection('about')}>
                了解更多
              </Button>
            </div>

            <div className="flex gap-4 pt-4">
              <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" 
                 className="text-zinc-400 hover:text-amber-500 transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
              <a href="https://space.bilibili.com/491306902" target="_blank" rel="noopener noreferrer"
                 className="text-zinc-400 hover:text-amber-500 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/yuzhengsun/" target="_blank" rel="noopener noreferrer"
                 className="text-zinc-400 hover:text-amber-500 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="mailto:yz@superlinear.academy"
                 className="text-zinc-400 hover:text-amber-500 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div className="relative order-first md:order-last">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"></div>
            <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" className="block">
              <img 
                src="/profile.jpg" 
                alt="Yuzheng Sun" 
                className="relative rounded-2xl shadow-2xl w-full hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="about" className="bg-zinc-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-amber-500">300K+</div>
              <div className="text-zinc-400">全网订阅者</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-amber-500">2000+</div>
              <div className="text-zinc-400">课程学员</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-amber-500">4.9/5</div>
              <div className="text-zinc-400">课程评分</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-amber-500">数百期</div>
              <div className="text-zinc-400">嘉宾访谈</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Builders Course Section */}
      <section id="course" className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Build with AI
          </h2>
          <p className="text-xl text-zinc-400">上手实战案例，吃透AI原理</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">课程特色</CardTitle>
              <CardDescription className="text-zinc-400">
                全网质量最高、最受好评的AI课程之一
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Maven Top AI Instructor</div>
                  <div className="text-sm text-zinc-400">Maven评选的顶级AI讲师</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">300+页原创课件</div>
                  <div className="text-sm text-zinc-400">5.5小时精心录制视频</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">8个实战项目</div>
                  <div className="text-sm text-zinc-400">动手实践，建立Builder心态</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">终身社区支持</div>
                  <div className="text-sm text-zinc-400">一次购买，终身更新答疑</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-white">课程成果</CardTitle>
              <CardDescription className="text-amber-100">
                学员真实反馈
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-white">
              <blockquote className="border-l-4 border-white/30 pl-4 italic">
                "通过课程建立的'构建者心态'，我用一门我本不熟悉的编程语言，从零开始构建了一个工具，并用它赚回了大约两倍的学费。"
              </blockquote>
              <div className="text-sm text-amber-100">— Marvin, Developer at Yipi Tech</div>
              
              <div className="pt-4">
                <Button size="lg" className="w-full bg-white text-amber-700 hover:bg-zinc-100">
                  <a href="https://www.superlinear.academy/ai-builders" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full">
                    查看完整课程
                    <TrendingUp className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Background Section */}
      <section id="background" className="bg-zinc-800/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Professional Background</h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-amber-500" />
                  <CardTitle className="text-white">Education</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-zinc-300">
                  <div className="font-semibold text-white">康奈尔大学 (Cornell University)</div>
                  <div className="text-zinc-400">经济学博士 (PhD in Economics)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-amber-500" />
                  <CardTitle className="text-white">Career Highlights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-white">Statsig (Acquired by OpenAI)</div>
                    <div className="text-zinc-400">Evangelist - 布道师</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-white">腾讯 (Tencent)</div>
                    <div className="text-zinc-400">数据科学副总监 (AI Director)</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-white">Meta (Facebook)</div>
                    <div className="text-zinc-400">数据科学家 (Data Scientist)</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-white">Amazon</div>
                    <div className="text-zinc-400">经济学家 (Economist)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-amber-500" />
                  <CardTitle className="text-white">Content & Community</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-zinc-300">
                  从2020年创立频道「课代表立正」，进行一系列AI科普和嘉宾访谈，推动AI认知进步，全网有三十万订阅。
                </p>
                <p className="text-zinc-300">
                  2023年发表《关于ChatGPT最重要的五个问题》，成为中文互联网最有影响力的AI科普文章之一，文章中的多数预测已成为现实。
                </p>
                <p className="text-zinc-300">
                  创立 <span className="text-amber-500 font-semibold">Superlinear Academy</span> 社区，汇聚AI时代的Builder和终身学习者。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto px-4 py-16 md:py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">学员评价</h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <p className="text-zinc-300 mb-4">
                "尽管我日常工作就在使用AI工具，但我发现自己依然能学到新的、更深层次的东西，并且能够更有效地利用AI来构建解决方案。"
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">Clairy Cheung</div>
                <div className="text-zinc-400">UX Manager, Google</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <p className="text-zinc-300 mb-4">
                "这门课真的能教会你正确的思维方式，并且给你更有效自学的能力。"
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">Shuyang</div>
                <div className="text-zinc-400">Senior Applied Science Manager, Uber</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <p className="text-zinc-300 mb-4">
                "思考如何用AI解决问题，已经成为了我的一个习惯。我在日常生活中亲身感受到了AI的好处。"
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">Tingting Wang</div>
                <div className="text-zinc-400">Applied Scientist, Microsoft</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-zinc-400 text-sm">
            所有评价来自Maven平台，公开、实名、可追溯
          </p>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-700 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              加入Superlinear Academy社区
            </h2>
            <p className="text-amber-100 mb-8">
              与AI时代的Builder和终身学习者一起成长
            </p>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <iframe 
                style={{ border: 0, boxShadow: 'none', width: '100%', height: '80vh', minHeight: '600px' }} 
                src="https://www.superlinear.academy/c/ai-resources?iframe=true"
                title="Superlinear Academy Community"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">课代表立正</h3>
              <p className="text-zinc-400 text-sm">
                帮助更多人在AI时代成为高效的Builder
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">链接</h3>
              <div className="space-y-2">
                <div><a href="https://www.superlinear.academy/ai-builders" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-amber-500 text-sm">AI Builders课程</a></div>
                <div><a href="https://www.superlinear.academy" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-amber-500 text-sm">Superlinear Academy</a></div>
                <div><a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-amber-500 text-sm">YouTube频道</a></div>
                <div><a href="https://space.bilibili.com/491306902" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-amber-500 text-sm">B站频道</a></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">联系方式</h3>
              <div className="space-y-2">
                <div className="text-zinc-400 text-sm">yz@superlinear.academy</div>
                <div className="flex gap-4 pt-2">
                  <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer" 
                     className="text-zinc-400 hover:text-amber-500 transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/yuzhengsun/" target="_blank" rel="noopener noreferrer"
                     className="text-zinc-400 hover:text-amber-500 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="mailto:yz@superlinear.academy"
                     className="text-zinc-400 hover:text-amber-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-400 text-sm">
            © 2025 Yuzheng Sun. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

