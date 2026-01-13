/**
 * Employee Projects Page (Read-Only)
 * View portfolio projects without ability to edit
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  FolderOpen,
  ExternalLink,
  Eye,
  Calendar,
  Tag,
} from 'lucide-react';
import { format } from 'date-fns';
import EmployeeLayout from '../components/EmployeeLayout';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://gtafs0o8rd.execute-api.eu-central-1.amazonaws.com/dev';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const { getIdToken, employee } = useEmployeeAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (employee?.email) {
        headers['X-Employee-Email'] = employee.email;
      }

      const response = await fetch(`${API_URL}/employee/projects`, {
        headers,
      });

      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      setProjects(data.data?.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 mt-1">View portfolio projects</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            Read-only access
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-900 border border-gray-800 rounded-xl">
            <FolderOpen className="w-12 h-12 mb-4 opacity-50" />
            <p>No projects found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
              >
                {/* Project image */}
                {project.image ? (
                  <div className="aspect-video bg-gray-800 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                    <FolderOpen className="w-12 h-12 text-green-400/50" />
                  </div>
                )}

                {/* Project info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white truncate">
                      {project.title}
                    </h3>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-400 flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {project.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{project.category}</span>
                      </div>
                    )}
                    {project.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(project.createdAt), 'MMM yyyy')}</span>
                      </div>
                    )}
                  </div>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.technologies.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs rounded">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
