import React from 'react';
import { MapPin, ThumbsUp, Calendar, ArrowRight, Tag } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';

export function IssueCard({ issue, onTrack, onUpvote }) {
  const formattedDate = new Date(issue.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      
      {/* Photo header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={issue.image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'}
          alt={issue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';
          }}
        />

        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <StatusBadge status={issue.status} />
          {issue.priority && issue.priority !== 'Low' && (
            <PriorityBadge priority={issue.priority} />
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur text-white text-xs font-mono font-semibold px-2.5 py-1 rounded-md">
          {issue.id}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Department */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="inline-flex items-center gap-1 font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              <Tag className="w-3 h-3" />
              {issue.category_name || issue.category_id}
            </span>
            <span>•</span>
            <span className="truncate">{issue.department_name || 'Pending assignment'}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onTrack(issue.id)}
            className="text-base font-semibold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
          >
            {issue.title}
          </h3>

          {/* Description snippet */}
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {issue.description}
          </p>

          {/* Location */}
          <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{issue.address} {issue.landmark ? `(${issue.landmark})` : ''}</span>
          </div>
        </div>

        {/* Footer info & actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpvote(issue.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium border border-slate-200 transition-colors"
              title="Click if you also face this issue"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{issue.upvotes}</span>
            </button>

            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          <button
            onClick={() => onTrack(issue.id)}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 group/btn"
          >
            Track Status
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>

        </div>

      </div>

    </div>
  );
}
