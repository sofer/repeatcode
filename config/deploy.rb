set :application, "repeatcode"
set :target, "173.45.226.186"
set :repository,  "."
set :port, 30000

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:
set :user, "sofer"
set :deploy_to, "/home/#{user}/public_html/#{application}"
set :use_sudo, false

# If you aren't using Subversion to manage your source code, specify
# your SCM below:
set :scm, :git

# see http://toolmantim.com/article/2007/11/20/cap_deploy_via_scp
set :deploy_via, :copy
set :git_shallow_clone, 1
set :copy_remote_dir, "/home/#{user}/tmp"

# Problems here, which I don't understand
#set :deploy_via, :remote_cache
#set :git_shallow_clone, 1
#set :git_enable_submodules, 1

role :app, target
role :web, target
role :db,  target, :primary => true

# see http://tomcopeland.blogs.com/juniordeveloper/2008/05/mod_rails-and-c.html
namespace :deploy do
  desc "Restarting mod_rails with restart.txt"
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "touch #{current_path}/tmp/restart.txt"
  end

  [:start, :stop].each do |t|
    desc "#{t} task is a no-op with mod_rails"
    task t, :roles => :app do ; end
  end
end

desc "Run cleanup after every deployment"
task :after_deploy do
#  deploy:cleanup
end