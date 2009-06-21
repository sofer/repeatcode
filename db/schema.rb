# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20090621145955) do

  create_table "administrators", :force => true do |t|
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "areas", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "authorships", :force => true do |t|
    t.integer  "subject_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "course_topics", :force => true do |t|
    t.integer  "course_id"
    t.integer  "topic_id"
    t.string   "name"
    t.text     "code"
    t.text     "data"
    t.boolean  "ignore_punctuation"
    t.boolean  "add_together"
    t.boolean  "rtl"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "removed",            :default => false
  end

  create_table "courses", :force => true do |t|
    t.integer  "subject_id"
    t.integer  "accuracy_target"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "last_question"
    t.boolean  "archived"
    t.integer  "lesson_target"
    t.integer  "weekly_target"
    t.string   "name"
    t.string   "extended_chars"
    t.boolean  "phrase_speech"
    t.boolean  "response_speech"
    t.string   "response_voice"
    t.string   "phrase_voice"
    t.datetime "synched_at"
    t.integer  "repetitions",     :default => 9
  end

  create_table "enrolments", :force => true do |t|
    t.integer  "user_id"
    t.integer  "group_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "exercises", :force => true do |t|
    t.integer  "topic_id"
    t.integer  "position"
    t.string   "description"
    t.string   "phrase"
    t.string   "response"
    t.string   "pattern"
    t.text     "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "hint"
    t.string   "insert"
    t.boolean  "removed",     :default => false
  end

  create_table "groups", :force => true do |t|
    t.string   "name"
    t.integer  "organization_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "intervals", :force => true do |t|
    t.integer  "course_id"
    t.integer  "index_no"
    t.integer  "minutes"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "lessons", :force => true do |t|
    t.integer  "course_id"
    t.integer  "correct_responses"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "total_questions_started"
  end

  create_table "managers", :force => true do |t|
    t.integer  "user_id"
    t.integer  "organization_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "memberships", :force => true do |t|
    t.integer  "organization_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "organizations", :force => true do |t|
    t.string   "name"
    t.integer  "default_target"
    t.integer  "default_lesson_target"
    t.integer  "super_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "questions", :force => true do |t|
    t.integer  "course_id"
    t.integer  "exercise_id"
    t.integer  "current_interval"
    t.datetime "next_datetime"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "extra"
    t.integer  "course_topic_id"
    t.string   "phrase"
    t.string   "response"
    t.string   "pattern"
    t.text     "notes"
    t.string   "hint"
    t.string   "insert"
    t.boolean  "ignore",           :default => false
    t.boolean  "amended",          :default => false
  end

  create_table "responses", :force => true do |t|
    t.integer  "question_id"
    t.integer  "lesson_id"
    t.integer  "seconds_taken"
    t.integer  "interval"
    t.string   "content"
    t.string   "result"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "subjects", :force => true do |t|
    t.string   "name"
    t.boolean  "public"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "archived"
    t.integer  "area_id"
    t.string   "extended_chars"
    t.string   "phrase_speech"
    t.string   "response_speech"
    t.boolean  "ignore_punctuation", :default => true
  end

  create_table "subscriptions", :force => true do |t|
    t.integer  "course_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "topics", :force => true do |t|
    t.integer  "subject_id"
    t.string   "name"
    t.integer  "position"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "code"
    t.text     "data"
    t.boolean  "add_together"
    t.boolean  "ignore_punctuation", :default => true
    t.boolean  "rtl",                :default => false
    t.boolean  "removed",            :default => false
  end

  create_table "tuitions", :force => true do |t|
    t.integer  "user_id"
    t.integer  "group_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "tutors", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "login",                     :limit => 40
    t.string   "name",                      :limit => 100, :default => ""
    t.string   "email",                     :limit => 100
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            :limit => 40
    t.datetime "remember_token_expires_at"
    t.integer  "organization_id"
    t.string   "uid"
    t.boolean  "voice",                                    :default => false
    t.string   "last_login"
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

end
