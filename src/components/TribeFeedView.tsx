import React, { useState } from 'react';
import { TribePost } from '../data/seedData';
import { MealIllustration } from './CulinaryArt';
import { Flame, Heart, MessageCircle, PlusCircle, Send, ThumbsUp } from 'lucide-react';

interface TribeFeedViewProps {
  currentUserName: string;
  posts: TribePost[];
  onReact: (postId: string, reactionType: 'clap' | 'fire' | 'heart') => void;
  onAddComment: (postId: string, commentText: string) => void;
  onCreatePost: (newPost: {
    category: TribePost['category'];
    content: string;
    dishTitle?: string;
    weightDeltaKg?: string;
  }) => void;
}

const CATEGORY_LABELS: Record<TribePost['category'], string> = {
  prato_saudavel: 'Prato Moçambicano Saudável',
  pesagem_semanal: 'Pesagem Semanal',
  treino_concluido: 'Treino em Casa Concluído',
  motivacao: 'Conquista & Motivação',
};

export const TribeFeedView: React.FC<TribeFeedViewProps> = ({
  currentUserName,
  posts,
  onReact,
  onAddComment,
  onCreatePost,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<TribePost['category']>('prato_saudavel');
  const [dishOrWeightTag, setDishOrWeightTag] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [filterCategory, setFilterCategory] = useState<'all' | TribePost['category']>('all');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onCreatePost({
      category,
      content: content.trim(),
      dishTitle: category !== 'pesagem_semanal' && dishOrWeightTag.trim() ? dishOrWeightTag.trim() : undefined,
      weightDeltaKg: category === 'pesagem_semanal' && dishOrWeightTag.trim() ? dishOrWeightTag.trim() : undefined,
    });

    setContent('');
    setDishOrWeightTag('');
  };

  const filteredPosts =
    filterCategory === 'all'
      ? posts
      : posts.filter((p) => p.category === filterCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Publish Box */}
      <form
        onSubmit={handlePublish}
        className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4"
      >
        <div className="border-b border-slate-800 pb-4">
          <p className="text-xs font-medium text-emerald-400">Comunidade Exclusiva MZ</p>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Partilhar Conquista no Mural da Tribo
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Publicando como <strong className="text-slate-200">{currentUserName}</strong>
          </p>
        </div>

        <div>
          <label htmlFor="post-category" className="block text-xs font-medium text-slate-300 mb-1.5">
            Tipo de Partilha
          </label>
          <select
            id="post-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TribePost['category'])}
            className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="prato_saudavel">Prato Saudável Moçambicano</option>
            <option value="pesagem_semanal">Pesagem Semanal (Balança)</option>
            <option value="treino_concluido">Treino Funcional em Casa</option>
            <option value="motivacao">Mensagem Motivacional</option>
          </select>
        </div>

        <div>
          <label htmlFor="post-tag" className="block text-xs font-medium text-slate-300 mb-1.5">
            {category === 'pesagem_semanal'
              ? 'Resultado da Pesagem (ex: -1,8 kg esta semana)'
              : 'Destaque do Prato ou Treino (opcional)'}
          </label>
          <input
            id="post-tag"
            type="text"
            value={dishOrWeightTag}
            onChange={(e) => setDishOrWeightTag(e.target.value)}
            placeholder={
              category === 'pesagem_semanal'
                ? 'Ex: -1,8 kg na 2ª semana'
                : 'Ex: Peixe grelhado com batata-doce e matapa leve'
            }
            className="w-full min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="post-content" className="block text-xs font-medium text-slate-300 mb-1.5">
            A tua mensagem para a Tribo
          </label>
          <textarea
            id="post-content"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Partilha como correu a tua alimentação ou treino de hoje..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!content.trim()}
          className="min-h-[46px] w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar no Mural da Tribo</span>
        </button>
      </form>

      {/* Right Column: Feed Stream */}
      <div className="lg:col-span-7 space-y-5">
        {/* Interactive Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Todas as Partilhas' },
            { id: 'prato_saudavel', label: 'Pratos Saudáveis' },
            { id: 'pesagem_semanal', label: 'Pesagens' },
            { id: 'treino_concluido', label: 'Treinos' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id as typeof filterCategory)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed Posts */}
        <div className="space-y-5">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    {post.authorInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{post.authorName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>{post.authorCity}</span>
                      <span aria-hidden="true">·</span>
                      <span>{CATEGORY_LABELS[post.category]}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">{post.content}</p>

              {(post.dishTitle || post.weightDeltaKg) && (
                <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-400">
                      {post.weightDeltaKg ? 'Progresso Registado' : 'Registo Nutricional / Treino'}
                    </span>
                    <p className="text-sm font-semibold text-emerald-400">
                      {post.weightDeltaKg || post.dishTitle}
                    </p>
                  </div>
                  {post.illustrationVariant !== 'none' && (
                    <MealIllustration
                      variant={
                        post.illustrationVariant === 'fish_plate'
                          ? 'fish_sweetpotato'
                          : post.illustrationVariant === 'cassava_bowl'
                          ? 'cassava_eggs'
                          : 'chicken_nhemba'
                      }
                      className="w-24 h-16 shrink-0"
                    />
                  )}
                </div>
              )}

              {/* Reactions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onReact(post.id, 'clap')}
                    aria-label={`Aplaudir publicação de ${post.authorName}`}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      post.userReacted.clap
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Palmas</span>
                    <span className="font-mono-tabular">{post.reactions.clap}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReact(post.id, 'fire')}
                    aria-label={`Reagir com fogo à publicação de ${post.authorName}`}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      post.userReacted.fire
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fogo</span>
                    <span className="font-mono-tabular">{post.reactions.fire}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReact(post.id, 'heart')}
                    aria-label={`Adorar publicação de ${post.authorName}`}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      post.userReacted.heart
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Coração</span>
                    <span className="font-mono-tabular">{post.reactions.heart}</span>
                  </button>
                </div>

                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-mono-tabular">{post.comments.length} comentários</span>
                </span>
              </div>

              {/* Comments Section */}
              <div className="space-y-2.5 pt-2">
                {post.comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl bg-slate-950/70 border border-slate-800/80 px-3.5 py-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-0.5">
                      <strong className="text-slate-200">{c.author}</strong>
                      <span>{c.timeAgo}</span>
                    </div>
                    <p className="text-slate-300">{c.text}</p>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <label htmlFor={`comment-${post.id}`} className="sr-only">
                    Comentar publicação de {post.authorName}
                  </label>
                  <input
                    id={`comment-${post.id}`}
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                    }
                    placeholder="Escreve um comentário de apoio..."
                    className="flex-1 min-h-[40px] rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = (commentInputs[post.id] || '').trim();
                      if (!val) return;
                      onAddComment(post.id, val);
                      setCommentInputs({ ...commentInputs, [post.id]: '' });
                    }}
                    aria-label={`Enviar comentário para ${post.authorName}`}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Comentar</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
