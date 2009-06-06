set :application, "repeatcode"

set :target, "173.45.226.186"
set :repository,  "git@github.com:sofer/repeatcode.git"

set :user, "sofer"
set :deploy_to, "/home/#{user}/public_html/#{application}"

set :scm, :git
set :deploy_via, :remote_cache
set :git_shallow_clone, 1
set :git_enable_submodules, 1
set :port, 30000
set :use_sudo, false
ssh_options[:paranoid] = false
default_run_options[:pty] = true

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
  deploy:cleanup
end