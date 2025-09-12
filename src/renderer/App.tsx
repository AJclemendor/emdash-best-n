import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Spinner } from "./components/ui/spinner";
import { FolderOpen, Github, Globe, Check } from "lucide-react";

const App: React.FC = () => {
  const [version, setVersion] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [repositories, setRepositories] = useState<any[]>([]);

  useEffect(() => {
    // Load app info from Electron
    const loadAppInfo = async () => {
      try {
        const [appVersion, appPlatform, authStatus] = await Promise.all([
          window.electronAPI.getVersion(),
          window.electronAPI.getPlatform(),
          window.electronAPI.githubIsAuthenticated(),
        ]);
        setVersion(appVersion);
        setPlatform(appPlatform);
        setIsAuthenticated(authStatus);

        if (authStatus) {
          const [userInfo, repos] = await Promise.all([
            window.electronAPI.githubGetUser(),
            window.electronAPI.githubGetRepositories(),
          ]);
          setUser(userInfo);
          setRepositories(repos);
        }
      } catch (error) {
        console.error("Failed to load app info:", error);
      }
    };

    loadAppInfo();
  }, []);

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.githubAuth();
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        const repos = await window.electronAPI.githubGetRepositories();
        setRepositories(repos);
      } else {
        // Show helpful error message with better formatting
        alert(`GitHub Authentication Failed:\n\n${result.error}`);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert(
        "Authentication error occurred. Please check the console for details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await window.electronAPI.githubLogout();
      setIsAuthenticated(false);
      setUser(null);
      setRepositories([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleOpenProject = async () => {
    try {
      const result = await window.electronAPI.openProject();
      if (result.success && result.path) {
        // Check if it's a Git repository and connect to GitHub
        try {
          const gitInfo = await window.electronAPI.getGitInfo(result.path);
          if (gitInfo.isGitRepo) {
            // It's a Git repository - try to connect to GitHub
            if (isAuthenticated) {
              // User is authenticated with GitHub CLI
              const githubInfo = await window.electronAPI.connectToGitHub(result.path);
              if (githubInfo.success) {
                alert(`✅ Project connected to GitHub!\n\nRepository: ${githubInfo.repository}\nBranch: ${githubInfo.branch}\nPath: ${result.path}`);
              } else {
                alert(`⚠️ Git repository detected but couldn't connect to GitHub:\n\n${githubInfo.error}\n\nPath: ${result.path}`);
              }
            } else {
              // User not authenticated
              alert(`📁 Git repository detected!\n\nPath: ${result.path}\nRemote: ${gitInfo.remote || 'None'}\n\nConnect to GitHub CLI to enable full integration.`);
            }
          } else {
            // Not a Git repository
            alert(`📁 Project opened (not a Git repository)\n\nPath: ${result.path}`);
          }
        } catch (error) {
          console.error("Git detection error:", error);
          alert(`📁 Project opened\n\nPath: ${result.path}\n\nNote: Could not detect Git information.`);
        }
      } else if (result.error) {
        alert(`Failed to open project: ${result.error}`);
      }
    } catch (error) {
      console.error("Open project error:", error);
      alert("Failed to open project. Please check the console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-serif tracking-wider mb-4">orcbench</h1>
          <p className="text-lg font-serif text-gray-700 text-muted-foreground mb-4">
            Run multiple Codex Agents in parallel
          </p>
          {!isAuthenticated && (
            <div className="text-sm text-gray-500 max-w-2xl mx-auto">
              <p className="mb-2">
                <strong>Requirements:</strong> GitHub CLI must be installed
                and authenticated
              </p>
              <p className="text-xs">
                Install:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  brew install gh
                </code>{" "}
                • Authenticate:{" "}
                <code className="bg-gray-100 px-1 rounded">gh auth login</code>
              </p>
            </div>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full mr-3"
              />
              <span className="text-green-800 font-medium">
                Signed in as {user.name} (@{user.login})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-3 text-green-600 hover:text-green-800"
              >
                Sign out
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            onClick={handleOpenProject}
            size="lg" 
            className="min-w-[200px] bg-black text-white hover:bg-gray-800 hover:text-white border-black font-serif"
          >
            <FolderOpen className="mr-2 h-5 w-5" />
            Open Project
          </Button>
            <Button
              onClick={isAuthenticated ? handleLogout : handleGitHubAuth}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="min-w-[200px] font-serif bg-black text-white hover:bg-gray-800 hover:text-white border-black"
            >
              {isLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : isAuthenticated ? (
                <Check className="mr-2 h-5 w-5" />
              ) : (
                <Github className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Connecting..." : isAuthenticated ? "Connected" : "Open from GitHub"}
            </Button>
          <Button
            variant="secondary"
            size="lg"
            className="min-w-[200px] font-serif bg-black text-white hover:bg-gray-800 hover:text-white border-black"
            >
            <Globe className="mr-2 h-5 w-5 text-white" />
            Clone from URL
          </Button>
        </div>

        {isAuthenticated && repositories.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-serif text-center mb-6">
              Your Repositories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repositories.slice(0, 6).map((repo) => (
                <Card
                  key={repo.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {repo.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{repo.language || "No language"}</span>
                      <span>{repo.private ? "Private" : "Public"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {repositories.length > 6 && (
              <p className="text-center text-gray-500 mt-4">
                And {repositories.length - 6} more repositories...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
